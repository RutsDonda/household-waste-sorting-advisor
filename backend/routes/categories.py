from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from backend.config import DEFAULT_CATEGORIES
from backend.database import get_database
from backend.models.schemas import CategoryInfo

router = APIRouter(prefix="/api/categories", tags=["Waste Categories"])

@router.get("", response_model=List[CategoryInfo])
async def list_categories(db = Depends(get_database)):
    """Returns all supported waste categories and their respective bin assignments."""
    cursor = db.waste_categories.find({})
    items = await cursor.to_list(length=50)
    if not items:
        return [CategoryInfo(**c) for c in DEFAULT_CATEGORIES]
    return [CategoryInfo(**c) for c in items]

@router.post("", response_model=CategoryInfo, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryInfo, db = Depends(get_database)):
    """Enables extending the system with new specialized municipal waste categories."""
    existing = await db.waste_categories.find_one({"id": category.id})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category with ID '{category.id}' already exists."
        )

    cat_dict = category.model_dump()
    await db.waste_categories.insert_one(cat_dict)
    return category
