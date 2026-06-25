# PIMP — Plateforme de Product Information Management

Référentiel unique de données produits qui combine deux apports :

1. **Ingestion d'étiquette par IA de vision** — un fournisseur dépose la photo d'une
   étiquette, une IA de vision (Google **Gemini**) lit l'image et **pré-remplit la fiche
   produit** (nom, marque, EAN, catégorie, contenance, pays, composition…). L'utilisateur
   vérifie/corrige, puis enregistre (**human-in-the-loop**). **Upsert sur l'EAN** : si le
   produit existe déjà, il est mis à jour — jamais dupliqué.
2. **Gestion PIM complète** — catalogue à grande échelle, attributs dynamiques par famille,
   contenus multilingues (FR/EN), score de **complétude** explicable, **workflow** de
   gouvernance (brouillon → en revue → validé → publié) avec **rôles** (admin, marketing,
   achats, fournisseur), et **diffusion omnicanale** (e-commerce, marketplace, catalogue,
   mobile).

> Projet fusionné réalisé par **Philippe Sam EFTEKHARI** et **Anass IMLI**
> (dev4pimp25 — INSTA, encadrant : BM. Bui-Xuan).

---

## Stack technique

| Couche       | Technologie                                   |
|--------------|-----------------------------------------------|
| Frontend     | React 18 + Vite (SPA)                          |
| Backend      | FastAPI (Python) — API REST, doc OpenAPI auto  |
| Données      | SQLAlchemy — SQLite (dev) / PostgreSQL (prod)  |
| Auth         | JWT + rôles (RBAC)                             |
| Extraction   | IA de vision **Google Gemini** (tier gratuit), appelée côté serveur (clé secrète) |

Architecture **trois tiers** : présentation (React) / logique métier (FastAPI) / données
(SQLAlchemy), couplage faible par API REST authentifiée JWT.

---

## Démarrage le plus simple (Windows)

Double-cliquez sur **`start.bat`**. Au premier lancement il vous demande votre clé Gemini
(gratuite sur <https://aistudio.google.com/apikey>), installe les dépendances, peuple la base
de démonstration, puis ouvre l'interface.

- Interface : <http://localhost:5173>
- API + documentation interactive : <http://localhost:8000/docs>

Sur macOS / Linux : `bash start.sh`.

---

## Démarrage manuel (2 terminaux)

**Terminal 1 — backend**

```bash
cd backend
python -m venv .venv
#  Windows :  .venv\Scripts\activate
#  macOS/Linux : source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # puis collez votre clé Gemini dans GEMINI_API_KEY
python -m app.seed            # peuple la base (familles, catégories, ~610 produits)
uvicorn app.main:app --reload
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Démarrage Docker (une commande)

```bash
docker compose up --build
```

(La clé Gemini est lue depuis `backend/.env`.)

---

## Comptes de démonstration

| Identifiant   | Mot de passe     | Rôle                          |
|---------------|------------------|-------------------------------|
| `admin`       | `admin123`       | administrateur / data steward |
| `marketing`   | `marketing123`   | marketing                     |
| `achats`      | `achats123`      | achats                        |
| `fournisseur` | `fournisseur123` | fournisseur                   |

> Seul l'administrateur peut **valider** et **publier** un produit.

Deux étiquettes d'exemple (`etiquette-coca.jpg`, `etiquette-evian.jpg`) sont fournies à la
racine pour tester l'ingestion.

---

## Principales routes de l'API

| Méthode | Route                          | Rôle                                            |
|---------|--------------------------------|-------------------------------------------------|
| POST    | `/api/auth/login`              | Authentification (JWT + rôle)                   |
| POST    | `/api/ingest/extract`          | IA de vision : lit l'étiquette, renvoie le JSON |
| POST    | `/api/ingest/save`             | Enregistre la fiche validée (upsert EAN)        |
| GET     | `/api/products`                | Catalogue paginé + recherche + filtres          |
| GET     | `/api/products/{id}/completeness` | Score de complétude + champs manquants       |
| PUT     | `/api/products/{id}`           | Enrichissement collaboratif (multilingue)       |
| POST    | `/api/products/{id}/transition`| Transition de workflow (contrôlée rôle/complétude) |
| POST    | `/api/channels/{id}/publish`   | Publication sur un canal                         |
| GET     | `/api/channels/{canal}/export` | Flux adapté au canal                            |
| GET     | `/api/dashboard`               | Indicateurs de pilotage de la qualité           |

---

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

---

## Arborescence

```
PIMP/
├─ start.bat / start.sh         lancement en un clic
├─ docker-compose.yml           backend + frontend conteneurisés
├─ etiquette-*.jpg              étiquettes d'exemple pour la démo
├─ rapport_synthese.docx        document de synthèse (~12 pages)
├─ presentation.pptx            support de soutenance (~25 slides)
├─ backend/                     API FastAPI
│  ├─ app/
│  │  ├─ main.py                point d'entrée + montage /uploads
│  │  ├─ models.py · schemas.py modèle ORM & contrats Pydantic
│  │  ├─ auth.py · completeness.py  JWT/rôles & moteur de qualité
│  │  ├─ services/extraction.py IA de vision Gemini (clé côté serveur)
│  │  ├─ routers/               auth, products, ingest, workflow, channels, dashboard…
│  │  └─ seed.py                jeu de données de démonstration
│  └─ tests/                    pytest
├─ frontend/                    React + Vite
│  └─ src/
│     ├─ App.jsx · api.js · styles.css
│     └─ components/            Ingest, Catalog, ProductDetail, Dashboard, Channels, Login
└─ docs/                        diagrammes (architecture, MCD, séquences, Gantt) + générateurs
```
