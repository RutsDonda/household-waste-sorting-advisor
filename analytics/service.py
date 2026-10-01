"""
Analytics Service Layer
Coordinates Big Data processing between PySpark pipeline and local Pandas fallback.
Provides cached aggregations and on-demand batch run triggers.
"""

import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.config import settings
from analytics.pandas_fallback import run_pandas_batch_analytics

logger = logging.getLogger("waste_advisor.analytics.service")

class AnalyticsService:
    def __init__(self):
        self._cached_results: Optional[Dict[str, Any]] = None
        self._last_job_metadata: Optional[Dict[str, Any]] = None
        self.cache_file = Path(settings.DATA_DIR) / "analytics_cache.json"
        self._load_cache_from_disk()

    def _load_cache_from_disk(self):
        if self.cache_file.exists():
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self._cached_results = json.load(f)
                    self._last_job_metadata = {
                        "job_id": self._cached_results.get("job_id", "cached-init"),
                        "engine": self._cached_results.get("engine", "Pandas Analytics Engine"),
                        "timestamp": self._cached_results.get("timestamp", datetime.now().isoformat())
                    }
            except Exception as e:
                logger.warning(f"Could not load analytics cache: {e}")

    def _save_cache_to_disk(self, data: Dict[str, Any]):
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to persist analytics cache: {e}")

    async def run_batch_job(self, db) -> Dict[str, Any]:
        """
        Gathers raw prediction records from the database,
        dispatches to PySpark or Pandas analytics engine,
        and saves aggregated results.
        """
        job_id = f"batch-job-{uuid.uuid4().hex[:8]}"
        logger.info(f"Starting batch analytics job [{job_id}]...")

        # Fetch records from database
        cursor = db.waste_predictions.find({})
        records = await cursor.to_list(length=100000)

        # Decide whether to use PySpark or Pandas
        results = None
        engine_used = "Pandas Analytics Engine"

        if settings.BATCH_PROCESSING_ENGINE in ["pyspark", "auto"]:
            try:
                # Try invoking PySpark
                from analytics.pyspark_pipeline import run_spark_batch_analytics
                logger.info("Attempting execution with Apache Spark (PySpark)...")
                results = run_spark_batch_analytics(records)
                engine_used = "Apache Spark (PySpark)"
                logger.info("Apache Spark batch job completed successfully!")
            except Exception as e:
                logger.warning(f"Apache Spark execution skipped/failed ({e}). Falling back to Pandas Analytics Engine.")
                results = run_pandas_batch_analytics(records)
                engine_used = "Pandas Analytics Engine (Local Fallback)"
        else:
            results = run_pandas_batch_analytics(records)
            engine_used = "Pandas Analytics Engine"

        results["job_id"] = job_id
        results["engine"] = engine_used
        self._cached_results = results
        self._save_cache_to_disk(results)

        self._last_job_metadata = {
            "job_id": job_id,
            "engine": engine_used,
            "records_processed": results["records_processed"],
            "execution_time_seconds": results["execution_time_seconds"],
            "timestamp": results["timestamp"]
        }

        # Cache in database if connected
        try:
            await db.analytics_cache.insert_one({
                "job_id": job_id,
                "engine": engine_used,
                "records_processed": results["records_processed"],
                "execution_time_seconds": results["execution_time_seconds"],
                "timestamp": results["timestamp"]
            })
        except Exception:
            pass

        return {
            "job_id": job_id,
            "status": "COMPLETED",
            "engine_used": engine_used,
            "records_processed": results["records_processed"],
            "execution_time_seconds": results["execution_time_seconds"],
            "metrics_computed": [
                "Category distribution & counts",
                "Daily & weekly generation trends",
                "Municipal recycling & organic diversion rates",
                "Household segregation scores",
                "Top detected waste items"
            ],
            "timestamp": results["timestamp"]
        }

    async def get_analytics(self, db) -> Dict[str, Any]:
        """Returns the latest batch analytics; computes fresh if cache is empty."""
        if self._cached_results is None:
            await self.run_batch_job(db)
        return self._cached_results

    def get_last_job_metadata(self) -> Optional[Dict[str, Any]]:
        return self._last_job_metadata

analytics_service = AnalyticsService()
