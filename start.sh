#!/usr/bin/env bash
# Lancement PIMP (macOS / Linux) — backend FastAPI + frontend React.
set -e
cd "$(dirname "$0")"

echo "============================================"
echo "   PIMP - Product Information Management"
echo "============================================"

command -v python3 >/dev/null || { echo "[ERREUR] Python 3.10+ requis"; exit 1; }
command -v node >/dev/null || { echo "[ERREUR] Node.js 18+ requis"; exit 1; }

# Cle Gemini (premiere fois)
if [ ! -f backend/.env ]; then
  echo "Cle API Gemini gratuite : https://aistudio.google.com/apikey"
  read -r -p "Colle ta cle Gemini (ou Entree pour plus tard) : " GKEY
  cat > backend/.env <<EOF
DATABASE_URL=sqlite:///./pim.db
GEMINI_API_KEY=${GKEY}
GEMINI_MODEL=gemini-2.5-flash
EOF
  echo "backend/.env cree."
fi

# Backend
if [ ! -d backend/.venv ]; then
  echo "Creation de l'environnement Python..."
  python3 -m venv backend/.venv
  ./backend/.venv/bin/pip install -r backend/requirements.txt
  (cd backend && ./.venv/bin/python -m app.seed)
fi

# Frontend
if [ ! -d frontend/node_modules ]; then
  npm --prefix frontend install
fi

echo "Lancement..."
(cd backend && ./.venv/bin/uvicorn app.main:app --reload) &
BACK_PID=$!
(cd frontend && npm run dev) &
FRONT_PID=$!

echo "  - Interface : http://localhost:5173"
echo "  - API / doc : http://localhost:8000/docs"
trap "kill $BACK_PID $FRONT_PID 2>/dev/null" EXIT
wait
