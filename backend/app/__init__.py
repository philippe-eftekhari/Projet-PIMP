"""Package applicatif PIMP.

Charge les variables d'environnement depuis backend/.env le plus tot possible,
quel que soit le dossier depuis lequel on lance le serveur. Le repli (parseur
minimal) garantit le chargement meme si python-dotenv n'est pas installe.
"""
import os
from pathlib import Path

_ENV = Path(__file__).resolve().parent.parent / ".env"


def _load_env():
    # 1) python-dotenv si disponible
    try:
        from dotenv import load_dotenv
        load_dotenv(_ENV)
    except Exception:
        pass
    # 2) repli : parseur minimal (clé=valeur)
    try:
        if _ENV.exists():
            for line in _ENV.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())
    except Exception:
        pass


_load_env()
