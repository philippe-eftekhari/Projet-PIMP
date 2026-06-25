"""
Tests fonctionnels de l'API PIMP.
Couvre : santé, authentification, complétude, règles de gouvernance du workflow,
et diffusion omnicanale. Lancer avec :  pytest
"""
from conftest import auth_headers, get_family, create_product, enrich_full


# --------------------------------------------------------------------------
# Santé & authentification
# --------------------------------------------------------------------------
def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_login_ok(client):
    r = client.post("/api/auth/login", data={"username": "admin", "password": "admin123"})
    assert r.status_code == 200
    body = r.json()
    assert body["role"] == "admin"
    assert "access_token" in body


def test_login_wrong_password(client):
    r = client.post("/api/auth/login", data={"username": "admin", "password": "mauvais"})
    assert r.status_code == 400


# --------------------------------------------------------------------------
# Catalogue & complétude
# --------------------------------------------------------------------------
def test_create_and_list_product(client):
    p = create_product(client)
    r = client.get("/api/products", params={"q": p["sku"]})
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 1
    assert any(it["sku"] == p["sku"] for it in data["items"])


def test_completeness_lists_missing_fields(client):
    p = create_product(client)  # produit vide
    r = client.get(f"/api/products/{p['id']}/completeness")
    assert r.status_code == 200
    detail = r.json()
    assert detail["score"] < 100
    # un produit vide doit signaler des champs manquants explicites
    assert len(detail["missing"]) > 0
    assert "Au moins une image" in detail["missing"]


def test_enrichment_raises_completeness(client):
    p = create_product(client)
    enrich_full(client, p["id"])
    detail = client.get(f"/api/products/{p['id']}/completeness").json()
    assert detail["score"] == 100.0
    assert detail["missing"] == []


# --------------------------------------------------------------------------
# Gouvernance du workflow
# --------------------------------------------------------------------------
def test_transition_refused_if_incomplete(client):
    p = create_product(client)  # complétude faible
    r = client.post(f"/api/products/{p['id']}/transition",
                    json={"to_status": "in_review"},
                    headers=auth_headers(client))
    assert r.status_code == 400  # seuil de 60 % non atteint


def test_non_admin_cannot_approve(client):
    p = create_product(client)
    enrich_full(client, p["id"])
    # le marketing peut soumettre à validation
    r1 = client.post(f"/api/products/{p['id']}/transition",
                     json={"to_status": "in_review"},
                     headers=auth_headers(client, "marketing"))
    assert r1.status_code == 200
    # ... mais ne peut PAS valider (réservé à l'admin)
    r2 = client.post(f"/api/products/{p['id']}/transition",
                     json={"to_status": "approved"},
                     headers=auth_headers(client, "marketing"))
    assert r2.status_code == 403


def test_full_workflow_happy_path(client):
    p = create_product(client)
    enrich_full(client, p["id"])
    h = auth_headers(client, "admin")
    assert client.post(f"/api/products/{p['id']}/transition",
                       json={"to_status": "in_review"}, headers=h).status_code == 200
    assert client.post(f"/api/products/{p['id']}/transition",
                       json={"to_status": "approved"}, headers=h).status_code == 200
    # historique : 2 transitions enregistrées
    logs = client.get(f"/api/products/{p['id']}/logs").json()
    assert len(logs) == 2


def test_invalid_transition_rejected(client):
    p = create_product(client)
    enrich_full(client, p["id"])
    # draft -> published directement est interdit (il faut passer par in_review/approved)
    r = client.post(f"/api/products/{p['id']}/transition",
                    json={"to_status": "published"},
                    headers=auth_headers(client))
    assert r.status_code == 400


# --------------------------------------------------------------------------
# Diffusion omnicanale
# --------------------------------------------------------------------------
def test_publish_and_export_channel(client):
    p = create_product(client)
    enrich_full(client, p["id"])
    h = auth_headers(client, "admin")
    client.post(f"/api/products/{p['id']}/transition", json={"to_status": "in_review"}, headers=h)
    client.post(f"/api/products/{p['id']}/transition", json={"to_status": "approved"}, headers=h)
    # publication sur le canal e-commerce (réservé admin)
    pub = client.post(f"/api/channels/{p['id']}/publish", params={"channel": "ecommerce"}, headers=h)
    assert pub.status_code == 200
    assert "ecommerce" in pub.json()["channels"]
    # le produit doit apparaître dans le flux exporté
    flux = client.get("/api/channels/ecommerce/export").json()
    assert any(item["sku"] == p["sku"] for item in flux)


def test_export_unknown_channel(client):
    r = client.get("/api/channels/inconnu/export")
    assert r.status_code == 400
