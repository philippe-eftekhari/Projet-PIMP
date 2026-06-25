from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, models

router = APIRouter(prefix="/api/families", tags=["families"])


@router.get("", response_model=List[schemas.FamilyOut])
def list_families(db: Session = Depends(get_db)):
    return db.query(models.Family).all()


@router.get("/{family_id}", response_model=schemas.FamilyOut)
def get_family(family_id: int, db: Session = Depends(get_db)):
    return db.query(models.Family).get(family_id)
