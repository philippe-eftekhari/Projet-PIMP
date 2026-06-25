"""
Service d'extraction d'etiquette par IA de VISION (Google Gemini, tier gratuit).

Un modele de vision "regarde" l'image comme un humain et en sort des donnees
structurees, meme sur de vraies etiquettes (bouteilles courbees, logos, photos)
que reste illisibles pour un OCR classique.

L'appel se fait cote serveur : la cle API n'est JAMAIS exposee au frontend.
Elle est lue depuis la variable d'environnement GEMINI_API_KEY (fichier .env).
"""
import base64
import json
import os

import requests

# Modele gratuit (sans carte bancaire). Modifiable au besoin.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

PROMPT = """Tu es le moteur d'extraction d'une plateforme PIM (Product Information Management).
Analyse cette etiquette de produit et renvoie UNIQUEMENT un objet JSON, sans texte autour, avec ces cles :
- nom_produit (string)
- marque (string)
- fabricant (string)
- ean (string : uniquement les chiffres du code-barres)
- categorie (string, l'une de : "Eau", "Boisson", "Epicerie", "Frais", "Hygiene", "Autre")
- contenance (string, ex. "1,5 L")
- pays_origine (string)
- description (string courte)
- composition (tableau d'objets {"libelle": string, "valeur": string} pour chaque ligne nutritionnelle/minerale lisible)
Mets null si une information est absente, et un tableau vide pour composition si rien n'est lisible."""

# Categories canoniques (alignees avec le seed et l'interface)
CATEGORIES = ["Eau", "Boisson", "Epicerie", "Frais", "Hygiene", "Autre"]


class ExtractionError(Exception):
    """Erreur fonctionnelle d'extraction (cle absente, reponse illisible...)."""


def _normalize_composition(parsed: dict) -> None:
    comp = parsed.get("composition")
    if isinstance(comp, dict):
        parsed["composition"] = [
            {"libelle": k, "valeur": None if v is None else str(v)}
            for k, v in comp.items()
        ]
    elif not isinstance(comp, list):
        parsed["composition"] = []


def extract_from_label(image_bytes: bytes, mimetype: str = "image/jpeg") -> dict:
    """Envoie l'image a Gemini et renvoie la fiche produit pre-remplie (dict)."""
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key or "colle_ta_cle" in key:
        raise ExtractionError(
            "GEMINI_API_KEY manquante : ajoute ta cle dans le fichier backend/.env "
            "(cle gratuite sur https://aistudio.google.com/apikey)."
        )

    if not mimetype or not mimetype.startswith("image/"):
        mimetype = "image/jpeg"

    b64 = base64.b64encode(image_bytes).decode("ascii")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent"
    )
    body = {
        "contents": [
            {
                "parts": [
                    {"inline_data": {"mime_type": mimetype, "data": b64}},
                    {"text": PROMPT},
                ]
            }
        ],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0},
    }

    try:
        res = requests.post(
            url,
            headers={"Content-Type": "application/json", "x-goog-api-key": key},
            json=body,
            timeout=60,
        )
    except requests.RequestException as exc:
        raise ExtractionError(f"Appel a Gemini impossible : {exc}") from exc

    if not res.ok:
        raise ExtractionError(f"Gemini {res.status_code} : {res.text[:200]}")

    data = res.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(part.get("text", "") for part in parts)
        text = text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise ExtractionError("Reponse Gemini illisible (JSON invalide).") from exc

    _normalize_composition(parsed)
    # Normalisation legere de la categorie
    cat = (parsed.get("categorie") or "").strip().capitalize()
    parsed["categorie"] = cat if cat in CATEGORIES else (cat or None)
    return parsed
