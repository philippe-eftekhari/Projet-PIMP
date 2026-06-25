"""
Moteur de qualite des donnees.

La completude d'un produit = part des attributs REQUIS de sa famille
qui sont effectivement renseignes (toutes langues requises confondues),
+ presence d'au moins une image.

C'est une heuristique transparente et explicable (pas de score "magique").
"""
from sqlalchemy.orm import Session

from . import models

# langues que l'on souhaite couvrir pour les attributs localisables
REQUIRED_LOCALES = ["fr", "en"]


def compute_completeness(db: Session, product: models.Product) -> float:
    """Retourne un score 0..100 et le detail des champs manquants."""
    details = compute_completeness_detail(db, product)
    return details["score"]


def compute_completeness_detail(db: Session, product: models.Product) -> dict:
    if not product.family:
        return {"score": 0.0, "missing": [], "total": 0, "filled": 0}

    required_attrs = [a for a in product.family.attributes if a.required]

    # index des valeurs existantes : (attribute_id, locale) -> valeur non vide
    filled_keys = set()
    for v in product.values:
        if v.value and v.value.strip():
            filled_keys.add((v.attribute_id, v.locale))

    checks = []   # liste de (libelle, ok)
    for attr in required_attrs:
        if attr.localizable:
            for loc in REQUIRED_LOCALES:
                ok = (attr.id, loc) in filled_keys
                checks.append((f"{attr.label} ({loc})", ok))
        else:
            ok = any(k[0] == attr.id for k in filled_keys)
            checks.append((attr.label, ok))

    # exigence : au moins une image
    has_image = any(a.type == "image" for a in product.assets)
    checks.append(("Au moins une image", has_image))

    total = len(checks)
    filled = sum(1 for _, ok in checks if ok)
    missing = [label for label, ok in checks if not ok]
    score = round(100.0 * filled / total, 1) if total else 100.0

    return {"score": score, "missing": missing, "total": total, "filled": filled}


def refresh_completeness(db: Session, product: models.Product) -> None:
    """Recalcule et persiste le score sur le produit."""
    product.completeness = compute_completeness(db, product)
    db.add(product)
    db.commit()
