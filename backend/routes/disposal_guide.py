import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.database import get_database
from backend.models.schemas import DisposalGuideItem

router = APIRouter(prefix="/api/disposal-guide", tags=["Disposal Guide"])

@router.get("", response_model=List[DisposalGuideItem])
async def list_disposal_guides(
    category: Optional[str] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search item keyword"),
    db = Depends(get_database)
):
    """
    Returns the comprehensive, searchable household disposal directory.
    Guides citizens on how to clean, prepare, and sort every common waste item.
    """
    query = {}
    if category and category != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"item_name": {"$regex": search, "$options": "i"}},
            {"keywords": {"$regex": search, "$options": "i"}},
            {"instructions": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.disposal_guides.find(query).sort("item_name", 1)
    items = await cursor.to_list(length=100)

    results = []
    for item in items:
        doc = dict(item)
        doc["id"] = doc.pop("_id", str(doc.get("id", "")))
        results.append(DisposalGuideItem(**doc))
    return results

@router.get("/search", response_model=List[DisposalGuideItem])
async def search_disposal_guide(
    q: str = Query(..., description="Query term for waste item"),
    db = Depends(get_database)
):
    return await list_disposal_guides(search=q, db=db)

@router.post("", response_model=DisposalGuideItem, status_code=status.HTTP_201_CREATED)
async def add_disposal_guide_item(item: DisposalGuideItem, db = Depends(get_database)):
    """Allows administrators or environmental officers to register new disposal guidance."""
    doc = item.model_dump()
    doc["_id"] = f"guide-{item.item_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:4]}"
    await db.disposal_guides.insert_one(doc)
    doc["id"] = doc.pop("_id")
    return DisposalGuideItem(**doc)
