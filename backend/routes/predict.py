import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from backend.config import settings
from backend.database import get_database
from backend.models.schemas import CategoryConfirmRequest, WastePredictionResponse
from ml.predictor import predictor
from ml.model import WASTE_CLASSES, WASTE_CLASS_NAMES

router = APIRouter(prefix="/api/predict", tags=["AI Waste Classifier"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("", response_model=WastePredictionResponse)
async def predict_waste(
    file: UploadFile = File(...),
    household_id: Optional[str] = Form("HH-101"),
    db = Depends(get_database)
):
    """
    Accepts an uploaded household waste image, executes AI classification,
    assigns recommended disposal stream, stores prediction in database,
    and returns comprehensive disposal guidance.
    """
    # 1. Validate file extension
    ext = Path(file.filename or "image.jpg").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Save uploaded file safely
    file_id = f"waste_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = Path(settings.UPLOAD_DIR) / file_id

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image upload: {str(e)}"
        )

    # 3. Validate file size
    if os.path.getsize(dest_path) > MAX_FILE_SIZE:
        os.remove(dest_path)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum permitted limit of 10MB."
        )

    # 4. Execute AI Prediction
    prediction = predictor.predict_image(str(dest_path), filename_hint=file.filename)

    # 5. Build database document
    pred_id = f"pred-{uuid.uuid4().hex[:12]}"
    record = {
        "_id": pred_id,
        "item": prediction["item"],
        "category": prediction["category"],
        "category_name": prediction["category_name"],
        "confidence": prediction["confidence"],
        "recommended_bin": prediction["recommended_bin"],
        "bin_color": prediction["bin_color"],
        "instructions": prediction["instructions"],
        "recycling_tips": prediction["recycling_tips"],
        "is_low_confidence": prediction["is_low_confidence"],
        "warning": prediction["warning"],
        "timestamp": datetime.now().isoformat(),
        "image_url": f"/uploads/{file_id}",
        "household_id": household_id or "HH-101",
        "user_confirmed_category": None,
        "model_version": prediction["model_version"],
        "is_mock": prediction["is_mock"],
        "all_probabilities": prediction["all_probabilities"],
        "is_demo": False
    }

    await db.waste_predictions.insert_one(record)

    return WastePredictionResponse(
        id=pred_id,
        **{k: v for k, v in record.items() if k != "_id"}
    )

@router.post("/confirm")
async def confirm_category(payload: CategoryConfirmRequest, db = Depends(get_database)):
    """
    Records manual user confirmation or category correction for low-confidence or
    misclassified items.
    """
    if payload.confirmed_category not in WASTE_CLASSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category '{payload.confirmed_category}'. Valid: {WASTE_CLASSES}"
        )

    result = await db.waste_predictions.update_one(
        {"_id": payload.prediction_id},
        {"$set": {
            "user_confirmed_category": payload.confirmed_category,
            "user_confirmed_at": datetime.now().isoformat(),
            "feedback_notes": payload.notes
        }}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID '{payload.prediction_id}' not found."
        )

    return {
        "status": "success",
        "message": f"Confirmed category updated to '{WASTE_CLASS_NAMES[payload.confirmed_category]}'",
        "prediction_id": payload.prediction_id,
        "confirmed_category": payload.confirmed_category
    }

@router.post("/sample-test", response_model=WastePredictionResponse)
async def sample_test_prediction(
    item_sample: str = Form("plastic_bottle"),
    household_id: Optional[str] = Form("HH-101"),
    db = Depends(get_database)
):
    """
    Allows instant demonstration of AI waste classification using built-in samples
    (e.g., plastic_bottle, banana_peel, cardboard, soda_can, battery, chip_bag).
    """
    from ml.dataset import generate_sample_waste_image

    sample_category_map = {
        "plastic_bottle": ("plastic", "Plastic Water Bottle (PET)"),
        "banana_peel": ("organic", "Banana Peel"),
        "cardboard": ("dry_recyclable", "Cardboard Packaging Box"),
        "soda_can": ("metal", "Aluminum Soda Can"),
        "glass_jar": ("glass", "Glass Pickle Jar"),
        "battery": ("hazardous", "AA Alkaline Battery"),
        "old_phone": ("e_waste", "Old Smartphone"),
        "chip_bag": ("non_recyclable", "Multi-layer Snack Bag")
    }

    target_cat, target_item = sample_category_map.get(item_sample, ("plastic", "Plastic Water Bottle"))
    sample_file_id = f"sample_{item_sample}_{uuid.uuid4().hex[:6]}.jpg"
    dest_path = Path(settings.UPLOAD_DIR) / sample_file_id

    # Generate synthetic image artifact
    img = generate_sample_waste_image(target_cat, target_item)
    img.save(dest_path, "JPEG")

    # Predict
    prediction = predictor.predict_image(str(dest_path), filename_hint=item_sample)
    # Ensure item matches sample
    prediction["item"] = target_item
    prediction["category"] = target_cat
    prediction["category_name"] = WASTE_CLASS_NAMES[target_cat]

    pred_id = f"pred-{uuid.uuid4().hex[:12]}"
    record = {
        "_id": pred_id,
        "item": target_item,
        "category": target_cat,
        "category_name": WASTE_CLASS_NAMES[target_cat],
        "confidence": prediction["confidence"],
        "recommended_bin": prediction["recommended_bin"],
        "bin_color": prediction["bin_color"],
        "instructions": prediction["instructions"],
        "recycling_tips": prediction["recycling_tips"],
        "is_low_confidence": prediction["is_low_confidence"],
        "warning": prediction["warning"],
        "timestamp": datetime.now().isoformat(),
        "image_url": f"/uploads/{sample_file_id}",
        "household_id": household_id or "HH-101",
        "user_confirmed_category": None,
        "model_version": prediction["model_version"],
        "is_mock": prediction["is_mock"],
        "all_probabilities": prediction["all_probabilities"],
        "is_demo": True
    }

    await db.waste_predictions.insert_one(record)

    return WastePredictionResponse(
        id=pred_id,
        **{k: v for k, v in record.items() if k != "_id"}
    )
