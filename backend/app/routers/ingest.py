"""
Ingestion d'etiquette par IA de vision (fonctionnalite phare de la fusion).

Parcours "human-in-the-loop" :
  1. POST /api/ingest/extract  -> l'IA lit l'etiquette, renvoie une fiche PRE-REMPLIE
     (rien n'est encore enregistre : le fournisseur verifie/corrige d'abord).
  2. POST /api/ingest/save     -> enregistre la fiche validee. Upsert sur l'EAN :
     si un produit avec le meme code-barres existe deja, il est MIS A JOUR
     (jamais duplique).

Les produits ingeres rejoignent la famille "Grande consommation" (GRAND) et
suivent ensuite le meme cycle de vie / workflow que le reste du referentiel.
"""
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, auth, completeness, schemas
from ..services import extraction

router = APIRouter(prefix="/api/ingest", tags=["ingest"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Correspondance champ extrait -> code d'attribut de la famille GRAND
FIELD_TO_ATTR = {
    "marque": "marque",
    "fabricant": "fabricant",
    "ean": "ean",
    "contenance": "contenance",
    "pays_origine": "pays_origine",
    "description": "description",
}


# --------------------------------------------------------------------------
# Schemas d'entree/sortie
# --------------------------------------------------------------------------
class CompositionLine(BaseModel):
    libelle: str
    valeur: Optional[str] = None


class IngestSave(BaseModel):
    nom_produit: str
    marque: Optional[str] = ""
    fabricant: Optional[str] = ""
    ean: Optional[str] = ""
    categorie: Optional[str] = ""
    contenance: Optional[str] = ""
    pays_origine: Optional[str] = ""
    description: Optional[str] = ""
    composition: List[CompositionLine] = []
    etiquette: Optional[str] = ""
    etiquette_url: Optional[str] = ""


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _grand_family(db: Session) -> models.Family:
    fam = db.query(models.Family).filter(models.Family.code == "GRAND").first()
    if not fam:
        raise HTTPException(
            500,
            "Famille 'Grande consommation' absente. Lancez le peuplement : python -m app.seed",
        )
    return fam


def _attr_map(fam: models.Family) -> dict:
    return {a.code: a for a in fam.attributes}


def _set_value(db: Session, product: models.Product, attr: models.Attribute,
               value: str, locale: str = "fr") -> None:
    existing = next(
        (v for v in product.values
         if v.attribute_id == attr.id and v.locale == locale),
        None,
    )
    if existing:
        existing.value = value or ""
    else:
        product.values.append(
            models.AttributeValue(attribute_id=attr.id, locale=locale, value=value or "")
        )


# --------------------------------------------------------------------------
# Endpoints
# --------------------------------------------------------------------------
@router.post("/extract")
async def extract(
    etiquette: UploadFile = File(...),
    user: models.User = Depends(auth.get_current_user),
):
    """Lit l'etiquette via l'IA de vision et renvoie la fiche pre-remplie (sans sauvegarder)."""
    if not etiquette.content_type or not etiquette.content_type.startswith("image/"):
        raise HTTPException(400, "Image uniquement (JPG, PNG, WEBP). Pour un PDF, convertissez-le en image.")

    raw = await etiquette.read()
    if len(raw) > 8 * 1024 * 1024:
        raise HTTPException(400, "Fichier trop volumineux (max 8 Mo).")

    # On conserve l'image pour pouvoir l'attacher au produit a l'enregistrement.
    ext = os.path.splitext(etiquette.filename or "")[1].lower() or ".jpg"
    fname = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(UPLOAD_DIR, fname), "wb") as fh:
        fh.write(raw)

    try:
        data = extraction.extract_from_label(raw, etiquette.content_type)
    except extraction.ExtractionError as exc:
        raise HTTPException(502, str(exc))

    data["etiquette"] = etiquette.filename
    data["etiquette_url"] = f"/uploads/{fname}"
    return data


@router.post("/save", response_model=schemas.ProductDetail)
def save(payload: IngestSave, db: Session = Depends(get_db),
         user: models.User = Depends(auth.get_current_user)):
    """Enregistre la fiche validee (upsert sur l'EAN) dans la famille GRAND."""
    if not payload.nom_produit or not payload.nom_produit.strip():
        raise HTTPException(400, "Le nom du produit est obligatoire.")

    fam = _grand_family(db)
    attrs = _attr_map(fam)
    ean = (payload.ean or "").strip()

    # --- Upsert sur l'EAN ---------------------------------------------------
    product = None
    if ean and "ean" in attrs:
        product = (
            db.query(models.Product)
            .join(models.AttributeValue, models.AttributeValue.product_id == models.Product.id)
            .filter(
                models.Product.family_id == fam.id,
                models.AttributeValue.attribute_id == attrs["ean"].id,
                models.AttributeValue.value == ean,
            )
            .first()
        )

    if product is None:
        sku = f"GP-{ean}" if ean else f"GP-{uuid.uuid4().hex[:10].upper()}"
        if db.query(models.Product).filter(models.Product.sku == sku).first():
            sku = f"GP-{uuid.uuid4().hex[:10].upper()}"
        product = models.Product(
            sku=sku, name=payload.nom_produit.strip(),
            family_id=fam.id, status=models.ProductStatus.DRAFT, channels=[],
        )
        db.add(product)
        db.flush()
    else:
        product.name = payload.nom_produit.strip()

    # --- Categorie (rattachement a l'arborescence conso) --------------------
    if payload.categorie:
        cat = (
            db.query(models.Category)
            .filter(models.Category.name == payload.categorie)
            .first()
        )
        if cat:
            product.category_id = cat.id

    # --- Valeurs d'attributs ------------------------------------------------
    for field, code in FIELD_TO_ATTR.items():
        if code in attrs:
            value = getattr(payload, field) or ""
            locale = "fr"
            _set_value(db, product, attrs[code], value, locale)

    # composition -> attribut texte agrege "libelle: valeur; ..."
    if "composition" in attrs and payload.composition:
        comp = "; ".join(
            f"{c.libelle}: {c.valeur}" if c.valeur else c.libelle
            for c in payload.composition
        )
        _set_value(db, product, attrs["composition"], comp)

    # --- Image d'etiquette --------------------------------------------------
    if payload.etiquette_url:
        already = any(a.url == payload.etiquette_url for a in product.assets)
        if not already:
            product.assets.append(
                models.Asset(type="image", url=payload.etiquette_url,
                             alt=product.name, position=0)
            )

    db.commit()
    db.refresh(product)
    completeness.refresh_completeness(db, product)
    db.refresh(product)
    return product
