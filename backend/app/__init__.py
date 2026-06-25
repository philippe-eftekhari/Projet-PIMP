"""Package applicatif PIMP. Charge les variables d'environnement (.env) tot."""
try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # python-dotenv optionnel : variables d'env systeme sinon
    pass
