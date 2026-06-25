"""
Configuration des tests : on bascule sur une base SQLite dédiée (test_pim.db),
isolée de la base de développement, peuplée d'un jeu minimal et déterministe.
"""
import os
import pytest

# IMPORTANT : définir l'URL AVANT d'importer l'application,
# pour que l'ORM se connecte bien à la base de test.
os.environ["DATABASE_URL"] = "sqlite:///./test_pim.db"
if os.path.exists("test_pim.db"):
    os.remove("test_pim.db")

from fastapi.testclient import TestClient            # noqa: E402
from app.database import Base, engine, SessionLocal  # noqa: E402
from app import models, auth, completeness           # noqa: E402
from app.main import app                             # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def seed_test_db():
    """Crée le schéma et un jeu de données minimal une fois pour toute la session."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Deux utilisateurs : un admin (data steward) et un marketing
    db.add(models.User(username="admin", full_name="Admin",
                       hashed_password=auth.hash_password("admin123"),
                       role=models.UserRole.ADMIN))
    db.add(models.User(username="marketing", full_name="Marketing",
                       hashed_password=auth.hash_password("marketing123"),
                       role=models.UserRole.MARKETING))

    # Une famille avec 4 attributs requis (dont 2 localisables)
    fam = models.Family(code="ELEC", name="Electronique")
    db.add(fam)
    db.flush()
    db.add_all([
        models.Attribute(family_id=fam.id, code="nom_marketing", label="Nom marketing",
                         type=models.AttributeType.TEXT, required=True, localizable=True),
        models.Attribute(family_id=fam.id, code="description", label="Description",
                         type=models.AttributeType.TEXTAREA, required=True, localizable=True),
        models.Attribute(family_id=fam.id, code="prix", label="Prix",
                         type=models.AttributeType.PRICE, required=True),
        models.Attribute(family_id=fam.id, code="ean", label="EAN",
                         type=models.AttributeType.TEXT, required=True),
    ])
    db.commit()
    db.close()
    yield
    # Nettoyage
    if os.path.exists("test_pim.db"):
        try:
            os.remove("test_pim.db")
        except PermissionError:
            pass


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------- helpers réutilisables -----------------------
_counter = {"n": 0}


def auth_headers(client, user="admin"):
    pwd = {"admin": "admin123", "marketing": "marketing123"}[user]
    r = client.post("/api/auth/login", data={"username": user, "password": pwd})
    return {"Authorization": "Bearer " + r.json()["access_token"]}


def get_family(client):
    return client.get("/api/families").json()[0]


def new_sku():
    _counter["n"] += 1
    return f"ELEC-T{_counter['n']:04d}"


def create_product(client, sku=None):
    sku = sku or new_sku()
    fam = get_family(client)
    r = client.post("/api/products",
                    json={"sku": sku, "name": "Produit " + sku, "family_id": fam["id"]},
                    headers=auth_headers(client))
    return r.json()


def enrich_full(client, pid):
    """Renseigne tous les champs requis + une image -> complétude 100 %."""
    fam = get_family(client)
    values = []
    for a in fam["attributes"]:
        if not a["required"]:
            continue
        locales = ["fr", "en"] if a["localizable"] else ["fr"]
        for loc in locales:
            val = "12.50" if a["type"] == "price" else "Valeur de test"
            values.append({"attribute_id": a["id"], "locale": loc, "value": val})
    client.put(f"/api/products/{pid}", json={"values": values}, headers=auth_headers(client))
    client.post(f"/api/products/{pid}/assets",
                json={"type": "image", "url": "http://example.com/img.png"},
                headers=auth_headers(client))
