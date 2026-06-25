@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title PIMP - Lancement
cd /d "%~dp0"

echo ============================================
echo    PIMP - Product Information Management
echo    (backend FastAPI + frontend React)
echo ============================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Python n'est pas installe. Installe Python 3.10+ : https://www.python.org/downloads/
  pause & exit /b
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe. Installe la version LTS : https://nodejs.org
  pause & exit /b
)

rem --- Configuration de la cle Gemini (premiere fois) ---
if not exist "backend\.env" (
  echo Premiere configuration.
  echo Cle API Gemini gratuite ici : https://aistudio.google.com/apikey
  echo.
  set /p GKEY="Colle ta cle Gemini ici (ou Entree pour configurer plus tard) : "
  (
    echo DATABASE_URL=sqlite:///./pim.db
    echo GEMINI_API_KEY=!GKEY!
    echo GEMINI_MODEL=gemini-2.5-flash
  ) > "backend\.env"
  echo Fichier backend\.env cree.
  echo.
)

rem --- Backend : environnement virtuel + dependances + peuplement ---
if not exist "backend\.venv" (
  echo Creation de l'environnement Python...
  pushd backend
  python -m venv .venv
  call .venv\Scripts\activate.bat
  echo Installation des dependances backend...
  pip install -r requirements.txt
  echo Peuplement de la base de demonstration...
  python -m app.seed
  call deactivate
  popd
)

rem --- Frontend : dependances ---
if not exist "frontend\node_modules" (
  echo Installation des dependances frontend...
  call npm --prefix frontend install
)

echo.
echo Lancement du serveur (API) et de l'interface...
start "PIMP - API (FastAPI)"   cmd /k "cd /d %~dp0backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --reload"
start "PIMP - Interface (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Ouverture du navigateur...
timeout /t 8 /nobreak >nul
start "" http://localhost:5173

echo.
echo Termine. Laisse les deux fenetres ouvertes pendant l'utilisation.
echo   - Interface : http://localhost:5173
echo   - API / doc : http://localhost:8000/docs
exit /b
