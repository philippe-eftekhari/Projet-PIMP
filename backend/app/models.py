"""
Modele de donnees (master data produit).

Concepts cles d'un PIM :
- Family       : famille de produit -> definit QUELS attributs un produit possede
- Attribute    : attribut dynamique typage (text, number, boolean, select...)
- Category     : arborescence de classification (hierarchie n-niveaux)
- Product      : la fiche produit (le referentiel unique)
- AttributeValue : valeur d'un attribut pour un produit donne (+ langue)
- Asset        : media digital (image, video, fiche technique)
- ProductRelation : relations entre produits (similaire, accessoire, cross-sell)
- Variant      : decline un produit maitre (taille, couleur...)
- User         : utilisateur avec un role (gouvernance)
- WorkflowLog  : historique des changements d'etat (tracabilite)
"""
import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Float, JSON
)
from sqlalchemy.orm import relationship

from .database import Base


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------
class AttributeType(str, enum.Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    NUMBER = "number"
    BOOLEAN = "boolean"
    SELECT = "select"
    DATE = "date"
    PRICE = "price"


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"             # brouillon, en cours de saisie
    IN_REVIEW = "in_review"     # soumis a validation
    APPROVED = "approved"       # valide par un data steward
    PUBLISHED = "published"     # diffuse sur au moins un canal


class UserRole(str, enum.Enum):
    ADMIN = "admin"             # data steward / administrateur
    MARKETING = "marketing"     # enrichit descriptions, traductions
    PURCHASING = "purchasing"   # achats : prix, fournisseurs
    SUPPLIER = "supplier"       # fournisseur : donnees techniques


class RelationType(str, enum.Enum):
    SIMILAR = "similar"
    ACCESSORY = "accessory"
    CROSS_SELL = "cross_sell"
    UP_SELL = "up_sell"


# ---------------------------------------------------------------------------
# Familles & attributs dynamiques
# ---------------------------------------------------------------------------
class Family(Base):
    __tablename__ = "families"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, default="")

    attributes = relationship("Attribute", back_populates="family", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="family")


class Attribute(Base):
    __tablename__ = "attributes"
    id = Column(Integer, primary_key=True)
    family_id = Column(Integer, ForeignKey("families.id"))
    code = Column(String, nullable=False)
    label = Column(String, nullable=False)
    type = Column(Enum(AttributeType), default=AttributeType.TEXT)
    required = Column(Boolean, default=False)       # compte dans la completude
    localizable = Column(Boolean, default=False)    # valeur differente par langue
    options = Column(JSON, default=list)            # pour les SELECT
    unit = Column(String, default="")               # ex: "kg", "cm"

    family = relationship("Family", back_populates="attributes")


# ---------------------------------------------------------------------------
# Categories (arborescence)
# ---------------------------------------------------------------------------
class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    children = relationship("Category", backref="parent", remote_side=[id])
    products = relationship("Product", back_populates="category")


# ---------------------------------------------------------------------------
# Produit
# ---------------------------------------------------------------------------
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    sku = Column(String, unique=True, nullable=False)   # identifiant unique
    name = Column(String, nullable=False)
    status = Column(Enum(ProductStatus), default=ProductStatus.DRAFT)
    completeness = Column(Float, default=0.0)            # score 0..100 (cache)

    family_id = Column(Integer, ForeignKey("families.id"))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    parent_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # variante

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family = relationship("Family", back_populates="products")
    category = relationship("Category", back_populates="products")
    values = relationship("AttributeValue", back_populates="product", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("Product", backref="parent", remote_side=[id])
    logs = relationship("WorkflowLog", back_populates="product", cascade="all, delete-orphan")
    # canaux ou ce produit est publie (codes : "ecommerce", "marketplace"...)
    channels = Column(JSON, default=list)


class AttributeValue(Base):
    __tablename__ = "attribute_values"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    attribute_id = Column(Integer, ForeignKey("attributes.id"))
    locale = Column(String, default="fr")   # langue (multi-langue)
    value = Column(Text, default="")

    product = relationship("Product", back_populates="values")
    attribute = relationship("Attribute")


class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    type = Column(String, default="image")   # image / video / datasheet
    url = Column(String, nullable=False)
    alt = Column(String, default="")
    position = Column(Integer, default=0)

    product = relationship("Product", back_populates="assets")


class ProductRelation(Base):
    __tablename__ = "product_relations"
    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey("products.id"))
    target_id = Column(Integer, ForeignKey("products.id"))
    type = Column(Enum(RelationType), default=RelationType.SIMILAR)


# ---------------------------------------------------------------------------
# Gouvernance
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    full_name = Column(String, default="")
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.MARKETING)


class WorkflowLog(Base):
    __tablename__ = "workflow_logs"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    from_status = Column(String, default="")
    to_status = Column(String, default="")
    user = Column(String, default="")
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="logs")
