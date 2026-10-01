import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import db_manager, get_database
from backend.routes.predict import router as predict_router
from backend.routes.history import router as history_router
from backend.routes.categories import router as categories_router
from backend.routes.disposal_guide import router as disposal_guide_router
from backend.routes.analytics import router as analytics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("waste_advisor.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing Household Waste Sorting Advisor Backend...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await db_manager.connect()

    # Check if database has records; auto-seed demo data if empty
    db = get_database()
    try:
        count = await db.waste_predictions.count_documents({})
        if count == 0:
            logger.info("Database is empty. Triggering automatic seed of demo waste data & guides...")
            from backend.scripts.seed_data import seed_database
            await seed_database(total_predictions=600)
    except Exception as e:
        logger.warning(f"Startup seed check notice: {e}")

    yield

    # Shutdown
    logger.info("Shutting down backend services...")
    await db_manager.close()

app = FastAPI(
    title="Household Waste Sorting Advisor - Big Data & AI API",
    description="Intelligent municipal waste classification and Big Data analytics platform.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(categories_router)
app.include_router(disposal_guide_router)
app.include_router(analytics_router)

@app.get("/api/info")
async def app_info():
    return {
        "project": "Household Waste Sorting Advisor",
        "description": "Big Data System & AI Waste Classification Platform",
        "status": "online",
        "database_mode": db_manager.mode,
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": db_manager.mode,
        "is_connected": db_manager.is_connected
    }

# If frontend is built, serve React SPA directly as the final catch-all handler
from backend.config import BASE_DIR
frontend_dist = BASE_DIR / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {
            "project": "Household Waste Sorting Advisor",
            "message": "Frontend build not detected. Run 'npm run dev' inside frontend/ or 'npm run build'",
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
