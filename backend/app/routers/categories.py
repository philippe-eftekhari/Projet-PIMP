from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, models, auth

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.post("", response_model=schemas.CategoryOut)
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db),
                    user: models.User = Depends(auth.require_roles(models.UserRole.ADMIN))):
    cat = models.Category(name=payload.name, parent_id=payload.parent_id)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db),
                    user: models.User = Depends(auth.require_roles(models.UserRole.ADMIN))):
    cat = db.query(models.Category).get(cat_id)
    if not cat:
        raise HTTPException(404, "Categorie introuvable")
    db.delete(cat)
    db.commit()
    return {"ok": True}
