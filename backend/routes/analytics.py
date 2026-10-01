from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.database import get_database
from backend.models.schemas import (
    AdminAnalytics,
    AnalyticsSummary,
    BatchJobResponse,
    CategoryCountItem,
    DailyTrendItem,
    HouseholdStats,
    TopItemCount
)
from analytics.service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Big Data Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(db = Depends(get_database)):
    """Returns top-level municipal KPI metrics calculated by the batch analytics engine."""
    data = await analytics_service.get_analytics(db)
    return AnalyticsSummary(**data["summary"])

@router.get("/categories", response_model=List[CategoryCountItem])
async def get_category_distribution(db = Depends(get_database)):
    """Returns waste volume distribution across all 8 municipal categories."""
    data = await analytics_service.get_analytics(db)
    return [CategoryCountItem(**c) for c in data["category_distribution"]]

@router.get("/trends")
async def get_waste_trends(
    timeframe: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    db = Depends(get_database)
):
    """Returns time-series waste generation trends (daily, weekly, or monthly aggregations)."""
    data = await analytics_service.get_analytics(db)
    trends = data.get("daily_trends", [])

    if timeframe == "monthly":
        # Group daily points into months
        monthly_map: Dict[str, Dict[str, int]] = {}
        for d in trends:
            m_key = d["date"][:7]  # YYYY-MM
            if m_key not in monthly_map:
                monthly_map[m_key] = {"date": m_key, "total": 0, "organic": 0, "recyclable": 0, "hazardous_ewaste": 0, "other": 0}
            monthly_map[m_key]["total"] += d["total"]
            monthly_map[m_key]["organic"] += d["organic"]
            monthly_map[m_key]["recyclable"] += d["recyclable"]
            monthly_map[m_key]["hazardous_ewaste"] += d["hazardous_ewaste"]
            monthly_map[m_key]["other"] += d["other"]
        return list(monthly_map.values())

    return trends

@router.get("/top-items", response_model=List[TopItemCount])
async def get_top_items(db = Depends(get_database)):
    """Returns the most frequently detected waste items across all households."""
    data = await analytics_service.get_analytics(db)
    return [TopItemCount(**item) for item in data.get("top_items", [])]

@router.get("/households", response_model=List[HouseholdStats])
async def get_household_analytics(db = Depends(get_database)):
    """Returns household-level segregation metrics and project-defined waste management scores."""
    data = await analytics_service.get_analytics(db)
    return [HouseholdStats(**h) for h in data.get("household_stats", [])]

@router.get("/households/{household_id}", response_model=HouseholdStats)
async def get_single_household_profile(household_id: str, db = Depends(get_database)):
    data = await analytics_service.get_analytics(db)
    for h in data.get("household_stats", []):
        if h["household_id"].lower() == household_id.lower():
            return HouseholdStats(**h)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Household profile '{household_id}' not found."
    )

@router.get("/admin", response_model=AdminAnalytics)
async def get_admin_analytics(db = Depends(get_database)):
    """
    Returns administrative control dashboard metrics:
    - Data growth over time
    - Model confidence distribution histogram
    - Low-confidence records requiring review
    - Big Data batch job metadata
    """
    data = await analytics_service.get_analytics(db)
    summary = data["summary"]

    # Compute confidence distribution buckets
    cursor = db.waste_predictions.find({})
    records = await cursor.to_list(length=10000)

    bucket_defs = [
        ("0.50 - 0.69 (Low)", 0.50, 0.70),
        ("0.70 - 0.79 (Moderate)", 0.70, 0.80),
        ("0.80 - 0.89 (Good)", 0.80, 0.90),
        ("0.90 - 1.00 (High)", 0.90, 1.01)
    ]
    confidence_distribution = []
    for label, low, high in bucket_defs:
        count = sum(1 for r in records if low <= float(r.get("confidence", 0.0)) < high)
        confidence_distribution.append({"range": label, "count": count})

    # Fetch recent low-confidence items for audit
    low_cursor = db.waste_predictions.find({"confidence": {"$lt": 0.70}}).sort("timestamp", -1).limit(10)
    low_items = await low_cursor.to_list(length=10)
    low_cleaned = []
    for r in low_items:
        d = dict(r)
        d["id"] = d.pop("_id", str(d.get("id", "")))
        low_cleaned.append(d)

    # Calculate cumulative data growth over days
    growth = []
    cumulative = 0
    for day in data.get("daily_trends", []):
        cumulative += day["total"]
        growth.append({"date": day["date"], "daily": day["total"], "cumulative": cumulative})

    days_span = max(1, len(data.get("daily_trends", [])))
    predictions_per_day = round(summary["total_predictions"] / days_span, 1)

    return AdminAnalytics(
        total_households=summary["total_households"],
        total_predictions=summary["total_predictions"],
        predictions_per_day=predictions_per_day,
        confidence_distribution=confidence_distribution,
        top_items=[TopItemCount(**item) for item in data.get("top_items", [])],
        low_confidence_records=low_cleaned,
        data_growth=growth,
        storage_engine=db.__class__.__name__,
        last_batch_run=analytics_service.get_last_job_metadata()
    )

@router.post("/run-batch-job", response_model=BatchJobResponse)
async def trigger_batch_job(db = Depends(get_database)):
    """
    On-demand execution of the Big Data batch processing pipeline
    (Apache Spark with Pandas fallback).
    """
    res = await analytics_service.run_batch_job(db)
    return BatchJobResponse(**res)
