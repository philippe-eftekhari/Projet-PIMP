#!/bin/sh
set -e

# La base vit dans le volume monte sur /data (persistance entre redemarrages).
DB_FILE="/data/pim.db"

# On peuple la base uniquement au premier lancement (si elle n'existe pas encore).
if [ ! -f "$DB_FILE" ]; then
  echo "[entrypoint] Base absente -> peuplement initial (produits de demo)..."
  python -m app.seed
else
  echo "[entrypoint] Base existante detectee, peuplement ignore."
fi

echo "[entrypoint] Demarrage de l'API sur le port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
