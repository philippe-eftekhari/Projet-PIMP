"""
Workflow de gouvernance produit.

Transitions autorisees :
  draft      -> in_review   (tout contributeur, completude minimale requise)
  in_review  -> approved    (ADMIN uniquement)
  in_review  -> draft       (ADMIN : renvoi pour correction)
  approved   -> published   (ADMIN : diffusion)
  *          -> draft        (revenir en brouillon)
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, models, auth

router = APIRouter(prefix="/api/products", tags=["workflow"])

MIN_COMPLETENESS_TO_REVIEW = 60.0

ALLOWED = {
    "draft": ["in_review"],
    "in_review": ["approved", "draft"],
    "approved": ["published", "draft"],
    "published": ["draft"],
}


@router.post("/{product_id}/transition", response_model=schemas.ProductDetail)
def transition(product_id: int, payload: schemas.StatusChange,
               db: Session = Depends(get_db),
               user: models.User = Depends(auth.get_current_user)):
    p = db.query(models.Product).get(product_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")

    current = p.status.value
    target = payload.to_status
    if target not in ALLOWED.get(current, []):
        raise HTTPException(400, f"Transition {current} -> {target} non autorisee")

    # regles de gouvernance par role
    if target in ("approved", "published") and user.role != models.UserRole.ADMIN:
        raise HTTPException(403, "Seul un data steward (admin) peut valider/publier")
    if target == "in_review" and p.completeness < MIN_COMPLETENESS_TO_REVIEW:
        raise HTTPException(400,
            f"Completude insuffisante ({p.completeness}%). Minimum {MIN_COMPLETENESS_TO_REVIEW}% requis.")

    log = models.WorkflowLog(product_id=p.id, from_status=current, to_status=target,
                             user=user.username, comment=payload.comment)
    p.status = models.ProductStatus(target)
    db.add(log)
    db.commit()
    db.refresh(p)
    return p


@router.get("/{product_id}/logs", response_model=List[schemas.WorkflowLogOut])
def logs(product_id: int, db: Session = Depends(get_db)):
    return (db.query(models.WorkflowLog)
              .filter(models.WorkflowLog.product_id == product_id)
              .order_by(models.WorkflowLog.created_at.desc()).all())
