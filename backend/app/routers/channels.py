"""
Diffusion omnicanale.

Chaque canal recoit une projection ADAPTEE de la donnee produit :
  - ecommerce  : JSON riche (nom, description, attributs, images, prix)
  - marketplace: JSON aplati avec champs imposes (titre court, prix, EAN)
  - catalogue  : CSV simplifie (export PDF/catalogue papier)
  - mobile     : JSON allege (1 image, champs essentiels)

On ne publie que les produits APPROVED/PUBLISHED.
"""
import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, auth

router = APIRouter(prefix="/api/channels", tags=["channels"])

CHANNELS = ["ecommerce", "marketplace", "catalogue", "mobile"]


def _values_dict(product: models.Product, locale: str = "fr") -> dict:
    out = {}
    for v in product.values:
        if v.locale == locale and v.value:
            out[v.attribute.code] = v.value
    return out


def _publishable(db: Session):
    return (db.query(models.Product)
              .filter(models.Product.status.in_(["approved", "published"]))
              .all())


@router.post("/{product_id}/publish")
def publish(product_id: int, channel: str, db: Session = Depends(get_db),
            user: models.User = Depends(auth.require_roles(models.UserRole.ADMIN))):
    if channel not in CHANNELS:
        raise HTTPException(400, "Canal inconnu")
    p = db.query(models.Product).get(product_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")
    if p.status.value not in ("approved", "published"):
        raise HTTPException(400, "Le produit doit etre approuve avant publication")
    chans = list(p.channels or [])
    if channel not in chans:
        chans.append(channel)
    p.channels = chans
    if p.status == models.ProductStatus.APPROVED:
        p.status = models.ProductStatus.PUBLISHED
    db.commit()
    return {"product_id": product_id, "channels": chans}


@router.get("/{channel}/export")
def export_channel(channel: str, db: Session = Depends(get_db)):
    """Genere le flux adapte a un canal donne."""
    if channel not in CHANNELS:
        raise HTTPException(400, "Canal inconnu")
    products = [p for p in _publishable(db) if channel in (p.channels or [])]

    if channel == "ecommerce":
        data = [{
            "sku": p.sku, "name": p.name,
            "category": p.category.name if p.category else None,
            "attributes_fr": _values_dict(p, "fr"),
            "attributes_en": _values_dict(p, "en"),
            "images": [a.url for a in p.assets if a.type == "image"],
        } for p in products]
        return JSONResponse(data)

    if channel == "marketplace":
        data = [{
            "title": p.name[:80],
            "price": _values_dict(p).get("prix", ""),
            "ean": _values_dict(p).get("ean", ""),
            "main_image": next((a.url for a in p.assets if a.type == "image"), ""),
        } for p in products]
        return JSONResponse(data)

    if channel == "mobile":
        data = [{
            "sku": p.sku, "name": p.name,
            "price": _values_dict(p).get("prix", ""),
            "image": next((a.url for a in p.assets if a.type == "image"), ""),
        } for p in products]
        return JSONResponse(data)

    # catalogue -> CSV
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["SKU", "Nom", "Categorie", "Prix"])
    for p in products:
        writer.writerow([p.sku, p.name,
                         p.category.name if p.category else "",
                         _values_dict(p).get("prix", "")])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=catalogue.csv"})
