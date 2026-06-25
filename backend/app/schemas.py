"""Schemas Pydantic pour la validation et la serialisation de l'API."""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# ---- Attributs / familles -------------------------------------------------
class AttributeOut(BaseModel):
    id: int
    code: str
    label: str
    type: str
    required: bool
    localizable: bool
    options: list = []
    unit: str = ""

    class Config:
        from_attributes = True


class FamilyOut(BaseModel):
    id: int
    code: str
    name: str
    description: str = ""
    attributes: List[AttributeOut] = []

    class Config:
        from_attributes = True


# ---- Categories -----------------------------------------------------------
class CategoryOut(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


# ---- Valeurs / assets -----------------------------------------------------
class AttributeValueIn(BaseModel):
    attribute_id: int
    locale: str = "fr"
    value: str = ""


class AttributeValueOut(AttributeValueIn):
    id: int

    class Config:
        from_attributes = True


class AssetIn(BaseModel):
    type: str = "image"
    url: str
    alt: str = ""
    position: int = 0


class AssetOut(AssetIn):
    id: int

    class Config:
        from_attributes = True


# ---- Produits -------------------------------------------------------------
class ProductCreate(BaseModel):
    sku: str
    name: str
    family_id: int
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    values: Optional[List[AttributeValueIn]] = None


class ProductListItem(BaseModel):
    id: int
    sku: str
    name: str
    status: str
    completeness: float
    family_id: int
    category_id: Optional[int] = None
    channels: list = []

    class Config:
        from_attributes = True


class ProductDetail(ProductListItem):
    values: List[AttributeValueOut] = []
    assets: List[AssetOut] = []
    updated_at: Optional[datetime] = None


# ---- Workflow -------------------------------------------------------------
class StatusChange(BaseModel):
    to_status: str
    comment: str = ""


class WorkflowLogOut(BaseModel):
    id: int
    from_status: str
    to_status: str
    user: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Auth -----------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
