import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Root directory of the repository
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "waste_advisor_db"

    # Storage Paths
    UPLOAD_DIR: str = str(BASE_DIR / "backend" / "uploads")
    MODEL_DIR: str = str(BASE_DIR / "ml" / "saved_models")
    DATA_DIR: str = str(BASE_DIR / "data")

    # AI Configuration
    CONFIDENCE_THRESHOLD: float = 0.70
    MODEL_VERSION: str = "mobilenetv2-waste-v1.0"
    USE_FALLBACK_IF_NO_WEIGHTS: bool = True

    # Big Data / Spark
    SPARK_MASTER: str = "local[*]"
    BATCH_PROCESSING_ENGINE: str = "auto"  # auto | pyspark | pandas
    ENABLE_SPARK_FALLBACK: bool = True

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "allow"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Ensure required runtime directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.DATA_DIR, exist_ok=True)

# Standard Waste Categories & Bin Specifications
DEFAULT_CATEGORIES = [
    {
        "id": "organic",
        "name": "Organic / Wet Waste",
        "bin_name": "Wet Waste Bin",
        "bin_color": "green",
        "hex_color": "#16a34a",
        "description": "Biodegradable organic food scraps, vegetable peels, garden waste, tea bags, and coffee grounds.",
        "icon": "Apple"
    },
    {
        "id": "dry_recyclable",
        "name": "Dry / Recyclable Waste",
        "bin_name": "Dry Recyclable Bin",
        "bin_color": "blue",
        "hex_color": "#2563eb",
        "description": "Paper, clean cardboard, cartons, and generic dry clean recyclables.",
        "icon": "Package"
    },
    {
        "id": "plastic",
        "name": "Plastic",
        "bin_name": "Plastic Recyclables Bin",
        "bin_color": "yellow",
        "hex_color": "#eab308",
        "description": "PET/HDPE bottles, containers, clean wraps, jugs, and recyclable polymers.",
        "icon": "Sparkles"
    },
    {
        "id": "glass",
        "name": "Glass",
        "bin_name": "Glass Recycling Bin",
        "bin_color": "teal",
        "hex_color": "#0d9488",
        "description": "Beverage bottles, jars, intact glassware. Keep separate to avoid shattering.",
        "icon": "Wine"
    },
    {
        "id": "metal",
        "name": "Metal",
        "bin_name": "Metal & Scrap Bin",
        "bin_color": "indigo",
        "hex_color": "#6366f1",
        "description": "Aluminum beverage cans, tin food cans, foil, bottle caps, small metallic scrap.",
        "icon": "Shield"
    },
    {
        "id": "e_waste",
        "name": "E-Waste",
        "bin_name": "E-Waste Drop-off",
        "bin_color": "orange",
        "hex_color": "#f97316",
        "description": "Electronic components, old cables, phones, circuit boards, chargers. Requires authorized recycler.",
        "icon": "Cpu"
    },
    {
        "id": "hazardous",
        "name": "Hazardous Waste",
        "bin_name": "Hazardous Waste Depot",
        "bin_color": "red",
        "hex_color": "#dc2626",
        "description": "Batteries, paint cans, pesticides, chemicals, fluorescent tubes, medical waste. Handle with care!",
        "icon": "AlertTriangle"
    },
    {
        "id": "non_recyclable",
        "name": "Non-Recyclable Waste",
        "bin_name": "Landfill / Residual Bin",
        "bin_color": "black",
        "hex_color": "#4b5563",
        "description": "Heavily soiled wrappers, multilayer laminates, hygiene products, ceramics, residual trash.",
        "icon": "Trash2"
    }
]
