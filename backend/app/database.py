"""
Configuration de la base de données.
On utilise SQLAlchemy + SQLite par defaut (zero configuration pour la demo).
Le code reste compatible PostgreSQL : il suffit de changer DATABASE_URL.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite en local ; passer a postgresql://user:pass@host/db pour la prod
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pim.db")

# check_same_thread necessaire uniquement pour SQLite + FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependance FastAPI : fournit une session et la ferme proprement."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
