"""Tableau de bord : indicateurs de pilotage de la qualite des donnees."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(db: Session = Depends(get_db)):
    total = db.query(models.Product).count()

    by_status = dict(
        db.query(models.Product.status, func.count())
          .group_by(models.Product.status).all()
    )
    by_status = {k.value if hasattr(k, "value") else str(k): v for k, v in by_status.items()}

    avg_completeness = db.query(func.avg(models.Product.completeness)).scalar() or 0

    # repartition par tranche de completude
    buckets = {"0-25": 0, "25-50": 0, "50-75": 0, "75-100": 0}
    for (c,) in db.query(models.Product.completeness).all():
        if c < 25:
            buckets["0-25"] += 1
        elif c < 50:
            buckets["25-50"] += 1
        elif c < 75:
            buckets["50-75"] += 1
        else:
            buckets["75-100"] += 1

    # produits par canal
    channel_counts = {}
    for (chans,) in db.query(models.Product.channels).all():
        for ch in (chans or []):
            channel_counts[ch] = channel_counts.get(ch, 0) + 1

    return {
        "total_products": total,
        "by_status": by_status,
        "avg_completeness": round(avg_completeness, 1),
        "completeness_buckets": buckets,
        "channel_counts": channel_counts,
        "families": db.query(models.Family).count(),
        "categories": db.query(models.Category).count(),
    }
