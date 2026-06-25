"""
Point d'entree de l'API PIMP (projet fusionne).
Lance avec :  uvicorn app.main:app --reload
Documentation interactive : http://localhost:8000/docs
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import (
    auth, families, categories, products, workflow, channels, dashboard, ingest,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PIMP - Plateforme de Product Information Management",
    description=(
        "Referentiel unique de donnees produits : ingestion d'etiquette par IA de "
        "vision, enrichissement collaboratif, gouvernance par workflow et diffusion "
        "omnicanale."
    ),
    version="2.0.0",
)

# CORS pour autoriser le frontend (Vite sur 5173) a appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(families.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(workflow.router)
app.include_router(channels.router)
app.include_router(dashboard.router)
app.include_router(ingest.router)

# Images d'etiquettes uploadees, servies en statique (/uploads/xxx.jpg)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"status": "ok"}
