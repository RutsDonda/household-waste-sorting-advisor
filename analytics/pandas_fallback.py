"""
Pandas / NumPy Batch Analytics Engine (Local Fallback for PySpark)
Module: analytics.pandas_fallback

Provides high-performance local DataFrame aggregations matching the exact
schema, metric definitions, and output structure of the PySpark pipeline.
"""

import logging
import time
from datetime import datetime
from typing import Any, Dict, List
import pandas as pd
import numpy as np

from backend.config import DEFAULT_CATEGORIES

logger = logging.getLogger("waste_advisor.analytics.pandas")

CAT_MAP = {c["id"]: c["name"] for c in DEFAULT_CATEGORIES}
CAT_COLORS = {c["id"]: c["hex_color"] for c in DEFAULT_CATEGORIES}

def run_pandas_batch_analytics(input_records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Executes batch aggregations using Pandas DataFrames matching PySpark pipeline schema.
    """
    start_time = time.time()
    if not input_records:
        return _empty_analytics_result()

    df = pd.DataFrame(input_records)
    total_count = len(df)

    # Clean & normalize timestamps
    if "timestamp" in df.columns:
        df["ts"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df["date_str"] = df["ts"].dt.strftime("%Y-%m-%d").fillna(datetime.now().strftime("%Y-%m-%d"))
        df["month_str"] = df["ts"].dt.strftime("%Y-%m").fillna(datetime.now().strftime("%Y-%m"))
    else:
        now_str = datetime.now().strftime("%Y-%m-%d")
        df["date_str"] = now_str
        df["month_str"] = now_str[:7]

    df["confidence"] = pd.to_numeric(df.get("confidence", 0.9), errors="coerce").fillna(0.9)
    df["household_id"] = df.get("household_id", "HH-101").fillna("HH-101")
    df["category"] = df.get("category", "non_recyclable").fillna("non_recyclable")
    df["item"] = df.get("item", "General Waste").fillna("General Waste")

    # 1. Category Distribution
    cat_counts = df["category"].value_counts()
    cat_conf = df.groupby("category")["confidence"].mean()

    category_distribution = []
    for cat_id, count in cat_counts.items():
        category_distribution.append({
            "category": str(cat_id),
            "name": CAT_MAP.get(str(cat_id), str(cat_id).title()),
            "count": int(count),
            "percentage": round((count / max(1, total_count)) * 100, 2),
            "color": CAT_COLORS.get(str(cat_id), "#6b7280"),
            "avg_confidence": round(float(cat_conf.get(cat_id, 0.9)), 3)
        })

    # Ensure all 8 categories exist in distribution even if zero
    existing_cats = {c["category"] for c in category_distribution}
    for c in DEFAULT_CATEGORIES:
        if c["id"] not in existing_cats:
            category_distribution.append({
                "category": c["id"],
                "name": c["name"],
                "count": 0,
                "percentage": 0.0,
                "color": c["hex_color"],
                "avg_confidence": 0.0
            })

    # 2. Daily Trends
    recyclable_set = {"dry_recyclable", "plastic", "glass", "metal"}
    hazardous_set = {"e_waste", "hazardous"}

    daily_grouped = df.groupby("date_str")
    daily_trends = []
    for d_str, group in sorted(daily_grouped):
        total_d = len(group)
        org = int((group["category"] == "organic").sum())
        rec = int(group["category"].isin(recyclable_set).sum())
        haz = int(group["category"].isin(hazardous_set).sum())
        other = total_d - (org + rec + haz)
        daily_trends.append({
            "date": str(d_str),
            "total": total_d,
            "organic": org,
            "recyclable": rec,
            "hazardous_ewaste": haz,
            "other": max(0, other)
        })

    # 3. Top Detected Items
    top_items_df = df.groupby(["item", "category"]).size().reset_index(name="count")
    top_items_df = top_items_df.sort_values(by="count", ascending=False).head(10)
    top_items = [
        {"item": str(r["item"]), "category": str(r["category"]), "count": int(r["count"])}
        for _, r in top_items_df.iterrows()
    ]

    # 4. Household-level Stats & Scoring
    hh_grouped = df.groupby("household_id")
    household_stats = []
    for hh_id, group in hh_grouped:
        tot = len(group)
        rec = int(group["category"].isin(recyclable_set).sum())
        org = int((group["category"] == "organic").sum())
        ew = int((group["category"] == "e_waste").sum())
        haz = int((group["category"] == "hazardous").sum())
        rec_pct = round((rec / max(1, tot)) * 100, 1)
        org_pct = round((org / max(1, tot)) * 100, 1)

        # Waste score calculation (0-100)
        # Ratio of properly sorted recyclable and organic items + bonus for safely sequestering hazard/e-waste
        raw_score = ((rec + org) / max(1, tot)) * 85 + (15 if haz + ew > 0 else 10)
        score = round(min(100.0, max(0.0, raw_score)), 1)
        grade = "A (Excellent)" if score >= 85 else ("B (Good)" if score >= 70 else "C (Needs Attention)")

        recent_items = []
        for _, r in group.sort_values(by="date_str", ascending=False).head(5).iterrows():
            recent_items.append({
                "item": str(r["item"]),
                "category": str(r["category"]),
                "timestamp": str(r.get("timestamp", ""))
            })

        household_stats.append({
            "household_id": str(hh_id),
            "total_items": tot,
            "recyclable_count": rec,
            "recycling_percentage": rec_pct,
            "organic_count": org,
            "organic_percentage": org_pct,
            "e_waste_count": ew,
            "hazardous_count": haz,
            "waste_score": score,
            "score_grade": grade,
            "recent_items": recent_items
        })

    # Summary KPIs
    recyclable_total = sum(c["count"] for c in category_distribution if c["category"] in recyclable_set)
    organic_total = sum(c["count"] for c in category_distribution if c["category"] == "organic")
    ewaste_total = sum(c["count"] for c in category_distribution if c["category"] == "e_waste")
    hazardous_total = sum(c["count"] for c in category_distribution if c["category"] == "hazardous")
    avg_confidence = float(df["confidence"].mean())
    low_confidence_count = int((df["confidence"] < 0.70).sum())

    execution_time = round(time.time() - start_time, 4)

    return {
        "engine": "Pandas Analytics Engine (Local Fallback)",
        "records_processed": total_count,
        "execution_time_seconds": execution_time,
        "summary": {
            "total_predictions": total_count,
            "recyclable_count": recyclable_total,
            "recycling_percentage": round((recyclable_total / max(1, total_count)) * 100, 1),
            "organic_count": organic_total,
            "organic_percentage": round((organic_total / max(1, total_count)) * 100, 1),
            "e_waste_count": ewaste_total,
            "hazardous_count": hazardous_total,
            "average_confidence": round(avg_confidence, 3),
            "low_confidence_count": low_confidence_count,
            "total_households": len(household_stats)
        },
        "category_distribution": category_distribution,
        "daily_trends": daily_trends,
        "top_items": top_items,
        "household_stats": household_stats,
        "timestamp": datetime.now().isoformat()
    }

def _empty_analytics_result() -> Dict[str, Any]:
    return {
        "engine": "Pandas Analytics Engine",
        "records_processed": 0,
        "execution_time_seconds": 0.0,
        "summary": {
            "total_predictions": 0,
            "recyclable_count": 0,
            "recycling_percentage": 0.0,
            "organic_count": 0,
            "organic_percentage": 0.0,
            "e_waste_count": 0,
            "hazardous_count": 0,
            "average_confidence": 0.0,
            "low_confidence_count": 0,
            "total_households": 0
        },
        "category_distribution": [],
        "daily_trends": [],
        "top_items": [],
        "household_stats": [],
        "timestamp": datetime.now().isoformat()
    }
