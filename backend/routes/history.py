from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse

from backend.database import get_database

router = APIRouter(prefix="/api/history", tags=["Waste History"])

@router.get("")
async def get_history(
    category: Optional[str] = Query(None, description="Filter by category ID"),
    household_id: Optional[str] = Query(None, description="Filter by household ID"),
    search: Optional[str] = Query(None, description="Search item name"),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    max_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    is_low_confidence: Optional[bool] = Query(None),
    sort_by: str = Query("timestamp", regex="^(timestamp|confidence|item|category)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db = Depends(get_database)
):
    """
    Retrieves paginated and filtered historical waste predictions.
    Supports filtering by category, household, confidence range, and text search.
    """
    query: Dict[str, Any] = {}

    if category:
        query["category"] = category
    if household_id:
        query["household_id"] = household_id
    if search:
        query["item"] = {"$regex": search, "$options": "i"}
    if is_low_confidence is not None:
        query["is_low_confidence"] = is_low_confidence

    if min_confidence is not None or max_confidence is not None:
        conf_query = {}
        if min_confidence is not None:
            conf_query["$gte"] = min_confidence
        if max_confidence is not None:
            conf_query["$lte"] = max_confidence
        query["confidence"] = conf_query

    total_records = await db.waste_predictions.count_documents(query)

    # Sort direction
    dir_val = -1 if order == "desc" else 1
    skip = (page - 1) * limit

    cursor = db.waste_predictions.find(query).sort(sort_by, dir_val).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)

    # Clean _id for JSON output
    formatted = []
    for item in items:
        doc = dict(item)
        doc["id"] = doc.pop("_id", str(doc.get("id", "")))
        formatted.append(doc)

    return {
        "items": formatted,
        "total": total_records,
        "page": page,
        "limit": limit,
        "total_pages": (total_records + limit - 1) // limit if total_records > 0 else 1
    }

@router.get("/{prediction_id}")
async def get_prediction_detail(prediction_id: str, db = Depends(get_database)):
    doc = await db.waste_predictions.find_one({"_id": prediction_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record '{prediction_id}' not found."
        )
    doc["id"] = doc.pop("_id")
    return doc

@router.delete("/{prediction_id}")
async def delete_prediction(prediction_id: str, db = Depends(get_database)):
    result = await db.waste_predictions.delete_one({"_id": prediction_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record '{prediction_id}' not found."
        )
    return {"status": "success", "message": f"Deleted record '{prediction_id}'"}

@router.get("/export/csv", response_class=PlainTextResponse)
async def export_csv(db = Depends(get_database)):
    """Exports prediction history to CSV for external big data tooling or Excel analysis."""
    cursor = db.waste_predictions.find({}).sort("timestamp", -1).limit(5000)
    records = await cursor.to_list(length=5000)

    lines = ["id,household_id,item,category,confidence,recommended_bin,timestamp,is_low_confidence,user_confirmed_category"]
    for r in records:
        pid = r.get("_id", "")
        hh = r.get("household_id", "")
        item = f'"{r.get("item", "")}"'
        cat = r.get("category", "")
        conf = r.get("confidence", 0.0)
        bin_nm = f'"{r.get("recommended_bin", "")}"'
        ts = r.get("timestamp", "")
        low = r.get("is_low_confidence", False)
        conf_cat = r.get("user_confirmed_category") or ""
        lines.append(f"{pid},{hh},{item},{cat},{conf},{bin_nm},{ts},{low},{conf_cat}")

    return "\n".join(lines)
