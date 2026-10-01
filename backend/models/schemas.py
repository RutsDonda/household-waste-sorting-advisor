from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class CategoryInfo(BaseModel):
    id: str
    name: str
    bin_name: str
    bin_color: str
    hex_color: str
    description: str
    icon: Optional[str] = "Trash2"

class DisposalGuideItem(BaseModel):
    id: Optional[str] = None
    item_name: str
    category: str
    category_name: str
    recommended_bin: str
    bin_color: str
    instructions: List[str]
    recycling_tips: List[str] = []
    hazard_warning: Optional[str] = None
    keywords: List[str] = []

class WastePredictionResponse(BaseModel):
    id: str
    item: str
    category: str
    category_name: str
    confidence: float
    recommended_bin: str
    bin_color: str
    instructions: List[str]
    recycling_tips: List[str] = []
    is_low_confidence: bool = False
    warning: Optional[str] = None
    timestamp: str
    image_url: Optional[str] = None
    household_id: str = "HH-101"
    user_confirmed_category: Optional[str] = None
    model_version: str = "mobilenetv2-waste-v1.0"
    is_mock: bool = False
    all_probabilities: Optional[Dict[str, float]] = None

class CategoryConfirmRequest(BaseModel):
    prediction_id: str
    confirmed_category: str
    notes: Optional[str] = None

class CategoryCountItem(BaseModel):
    category: str
    name: str
    count: int
    percentage: float
    color: str

class DailyTrendItem(BaseModel):
    date: str
    total: int
    organic: int
    recyclable: int
    hazardous_ewaste: int
    other: int

class TopItemCount(BaseModel):
    item: str
    category: str
    count: int

class AnalyticsSummary(BaseModel):
    total_predictions: int
    recyclable_count: int
    recycling_percentage: float
    organic_count: int
    organic_percentage: float
    e_waste_count: int
    hazardous_count: int
    average_confidence: float
    low_confidence_count: int
    total_households: int

class HouseholdStats(BaseModel):
    household_id: str
    total_items: int
    recyclable_count: int
    recycling_percentage: float
    organic_count: int
    organic_percentage: float
    e_waste_count: int
    hazardous_count: int
    waste_score: float  # Project-defined metric (0-100)
    score_grade: str
    recent_items: List[Dict[str, Any]] = []

class ConfidenceBucket(BaseModel):
    range: str
    count: int

class AdminAnalytics(BaseModel):
    total_households: int
    total_predictions: int
    predictions_per_day: float
    confidence_distribution: List[ConfidenceBucket]
    top_items: List[TopItemCount]
    low_confidence_records: List[Dict[str, Any]]
    data_growth: List[Dict[str, Any]]
    storage_engine: str
    last_batch_run: Optional[Dict[str, Any]] = None

class BatchJobResponse(BaseModel):
    job_id: str
    status: str
    engine_used: str  # "Apache Spark (PySpark)" or "Pandas Analytics Engine"
    records_processed: int
    execution_time_seconds: float
    metrics_computed: List[str]
    timestamp: str
