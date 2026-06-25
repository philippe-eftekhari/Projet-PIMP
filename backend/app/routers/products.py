from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from .. import schemas, models, auth, completeness

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
def list_products(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    family_id: Optional[int] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
):
    """Liste paginee + filtres (gere un fort volume de produits)."""
    query = db.query(models.Product)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.Product.name.ilike(like),
                                 models.Product.sku.ilike(like)))
    if family_id:
        query = query.filter(models.Product.family_id == family_id)
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if status:
        query = query.filter(models.Product.status == status)

    total = query.count()
    items = (query.order_by(models.Product.id)
                  .offset((page - 1) * page_size)
                  .limit(page_size).all())
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [schemas.ProductListItem.model_validate(p) for p in items],
    }


@router.get("/{product_id}", response_model=schemas.ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).get(product_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")
    return p


@router.get("/{product_id}/completeness")
def get_completeness(product_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).get(product_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")
    return completeness.compute_completeness_detail(db, p)


@router.post("", response_model=schemas.ProductDetail)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db),
                   user: models.User = Depends(auth.get_current_user)):
    if db.query(models.Product).filter(models.Product.sku == payload.sku).first():
        raise HTTPException(400, "SKU deja existant")
    p = models.Product(sku=payload.sku, name=payload.name,
                        family_id=payload.family_id, category_id=payload.category_id,
                        channels=[])
    db.add(p)
    db.commit()
    db.refresh(p)
    completeness.refresh_completeness(db, p)
    return p


@router.put("/{product_id}", response_model=schemas.ProductDetail)
def update_product(product_id: int, payload: schemas.ProductUpdate,
                   db: Session = Depends(get_db),
                   user: models.User = Depends(auth.get_current_user)):
    """Enrichissement collaboratif : met a jour nom, categorie et valeurs d'attributs."""
    p = db.query(models.Product).get(product_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")
    if payload.name is not None:
        p.name = payload.name
    if payload.category_id is not None:
        p.category_id = payload.category_id

    if payload.values is not None:
        for v in payload.values:
            existing = next((x for x in p.values
                             if x.attribute_id == v.attribute_id and x.locale == v.locale), None)
            if existing:
                existing.value = v.value
            else:
                p.values.append(models.AttributeValue(
                    attribute_id=v.attribute_id, locale=v.locale, value=v.value))
    db.commit()
    db.refresh(p)
    completeness.refresh_completeness(db, p)
    return p


# ---- Assets ---------------------------------------------------------------
@router.post("/{product_id}/assets", response_model=schemas.AssetOut)
def add_asset(product_id: int, payload: schemas.AssetIn, db: Session = Depends(get_db),
              user: models.User = Depends(auth.get_current_user)):
    p = db.query(models.Product).get(product_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")
    asset = models.Asset(product_id=product_id, **payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    completeness.refresh_completeness(db, p)
    return asset


@router.delete("/{product_id}/assets/{asset_id}")
def delete_asset(product_id: int, asset_id: int, db: Session = Depends(get_db),
                 user: models.User = Depends(auth.get_current_user)):
    asset = db.query(models.Asset).get(asset_id)
    if asset:
        db.delete(asset)
        db.commit()
    p = db.query(models.Product).get(product_id)
    if p:
        completeness.refresh_completeness(db, p)
    return {"ok": True}
