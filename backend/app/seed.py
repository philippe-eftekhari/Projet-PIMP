"""
Peuplement de la base avec un jeu de donnees realiste.
Usage :  python -m app.seed   (depuis le dossier backend/)

Cree : utilisateurs (4 roles), familles + attributs (dont la famille
"Grande consommation" alimentee par l'ingestion d'etiquette), categories,
puis ~600 produits generiques + un echantillon de produits de grande
consommation, avec des niveaux d'enrichissement varies (pour que le tableau
de bord soit parlant).
"""
import random

from .database import Base, engine, SessionLocal
from . import models, auth, completeness

random.seed(42)


def reset():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed():
    reset()
    db = SessionLocal()

    # --- Utilisateurs --------------------------------------------------
    users = [
        ("admin", "Sophie Martin", "admin123", models.UserRole.ADMIN),
        ("marketing", "Lucas Bernard", "marketing123", models.UserRole.MARKETING),
        ("achats", "Emma Petit", "achats123", models.UserRole.PURCHASING),
        ("fournisseur", "ACME Supplies", "fournisseur123", models.UserRole.SUPPLIER),
    ]
    for username, full, pwd, role in users:
        db.add(models.User(username=username, full_name=full,
                           hashed_password=auth.hash_password(pwd), role=role))
    db.commit()

    # --- Familles + attributs -----------------------------------------
    families_def = {
        "ELEC": ("Electronique", [
            ("nom_marketing", "Nom marketing", "text", True, True, [], ""),
            ("description", "Description", "textarea", True, True, [], ""),
            ("prix", "Prix", "price", True, False, [], "EUR"),
            ("ean", "Code EAN", "text", True, False, [], ""),
            ("marque", "Marque", "text", True, False, [], ""),
            ("garantie", "Garantie", "number", False, False, [], "mois"),
            ("couleur", "Couleur", "select", False, False, ["Noir", "Blanc", "Gris", "Bleu"], ""),
            ("poids", "Poids", "number", False, False, [], "g"),
        ]),
        "TEXT": ("Textile", [
            ("nom_marketing", "Nom marketing", "text", True, True, [], ""),
            ("description", "Description", "textarea", True, True, [], ""),
            ("prix", "Prix", "price", True, False, [], "EUR"),
            ("ean", "Code EAN", "text", True, False, [], ""),
            ("matiere", "Matiere", "text", True, False, [], ""),
            ("taille", "Taille", "select", False, False, ["XS", "S", "M", "L", "XL"], ""),
            ("couleur", "Couleur", "select", False, False, ["Rouge", "Vert", "Bleu", "Noir"], ""),
        ]),
        "MAIS": ("Maison & Jardin", [
            ("nom_marketing", "Nom marketing", "text", True, True, [], ""),
            ("description", "Description", "textarea", True, True, [], ""),
            ("prix", "Prix", "price", True, False, [], "EUR"),
            ("ean", "Code EAN", "text", True, False, [], ""),
            ("dimensions", "Dimensions", "text", False, False, [], "cm"),
            ("materiau", "Materiau", "text", False, False, [], ""),
        ]),
        # Famille alimentee par l'ingestion d'etiquette (IA de vision)
        "GRAND": ("Grande consommation", [
            ("marque", "Marque", "text", True, False, [], ""),
            ("fabricant", "Fabricant", "text", False, False, [], ""),
            ("ean", "Code EAN", "text", True, False, [], ""),
            ("contenance", "Contenance", "text", False, False, [], ""),
            ("pays_origine", "Pays d'origine", "text", False, False, [], ""),
            ("description", "Description", "textarea", True, True, [], ""),
            ("composition", "Composition", "textarea", False, False, [], ""),
        ]),
    }
    family_objs = {}
    for code, (name, attrs) in families_def.items():
        fam = models.Family(code=code, name=name, description=f"Famille {name}")
        db.add(fam)
        db.flush()
        for (acode, label, atype, req, loc, opts, unit) in attrs:
            db.add(models.Attribute(family_id=fam.id, code=acode, label=label,
                                    type=models.AttributeType(atype), required=req,
                                    localizable=loc, options=opts, unit=unit))
        family_objs[code] = fam
    db.commit()

    # --- Categories (arborescence) ------------------------------------
    tree = {
        "Electronique": ["Smartphones", "Ordinateurs", "Audio", "Accessoires"],
        "Mode": ["Homme", "Femme", "Enfant"],
        "Maison": ["Cuisine", "Mobilier", "Jardin", "Decoration"],
        # Categories de grande consommation (alignees avec l'IA d'extraction)
        "Grande consommation": ["Eau", "Boisson", "Epicerie", "Frais", "Hygiene", "Autre"],
    }
    cat_objs = []
    cat_by_name = {}
    for root, subs in tree.items():
        r = models.Category(name=root, parent_id=None)
        db.add(r)
        db.flush()
        cat_objs.append(r)
        cat_by_name[root] = r
        for s in subs:
            c = models.Category(name=s, parent_id=r.id)
            db.add(c)
            db.flush()
            cat_objs.append(c)
            cat_by_name[s] = c
    db.commit()
    # Categories feuilles hors grande conso (pour les produits generiques)
    conso_cat_ids = {cat_by_name[n].id for n in
                     ["Eau", "Boisson", "Epicerie", "Frais", "Hygiene", "Autre"]}
    leaf_cats = [c for c in cat_objs
                 if c.parent_id is not None and c.id not in conso_cat_ids]

    # --- Produits generiques (ELEC / TEXT / MAIS) ---------------------
    brands = ["TechPro", "Nova", "Zenith", "Aura", "Pixel", "Vento", "Lumio"]
    adjectives = ["Pro", "Max", "Lite", "Plus", "Ultra", "Mini", "Air", "One"]
    noun = {"ELEC": ["Casque", "Enceinte", "Chargeur", "Cable", "Souris", "Clavier", "Webcam"],
            "TEXT": ["T-shirt", "Pull", "Veste", "Pantalon", "Chemise", "Robe"],
            "MAIS": ["Lampe", "Coussin", "Etagere", "Vase", "Cadre", "Tapis"]}

    statuses_pool = (["draft"] * 5 + ["in_review"] * 2 + ["approved"] * 2 + ["published"] * 1)
    generic_codes = ["ELEC", "TEXT", "MAIS"]
    count = 0
    for i in range(1, 601):
        fcode = random.choice(generic_codes)
        fam = family_objs[fcode]
        n = f"{random.choice(noun[fcode])} {random.choice(brands)} {random.choice(adjectives)}"
        p = models.Product(
            sku=f"{fcode}-{i:05d}",
            name=n,
            family_id=fam.id,
            category_id=random.choice(leaf_cats).id,
            status=models.ProductStatus(random.choice(statuses_pool)),
            channels=[],
        )
        db.add(p)
        db.flush()

        fill_ratio = random.random()
        for attr in fam.attributes:
            if random.random() < fill_ratio:
                locales = ["fr", "en"] if attr.localizable else ["fr"]
                for loc in locales:
                    if random.random() < fill_ratio:
                        val = _fake_value(attr, loc)
                        db.add(models.AttributeValue(product_id=p.id, attribute_id=attr.id,
                                                     locale=loc, value=val))
        for k in range(random.randint(0, 2)):
            db.add(models.Asset(product_id=p.id, type="image",
                                url=f"https://picsum.photos/seed/{p.sku}-{k}/400/400",
                                alt=n, position=k))
        if p.status == models.ProductStatus.PUBLISHED:
            p.channels = random.sample(["ecommerce", "marketplace", "catalogue", "mobile"],
                                       random.randint(1, 3))
        count += 1
        if count % 100 == 0:
            db.flush()

    # --- Produits de grande consommation (issus de l'ingestion) -------
    grand = family_objs["GRAND"]
    gattrs = {a.code: a for a in grand.attributes}
    conso = [
        ("Eau minerale naturelle Evian", "Evian", "Danone", "3068320123456", "1,5 L",
         "France", "Eau minerale naturelle, embouteillee a la source de Cachat.", "Calcium: 80 mg/L; Magnesium: 26 mg/L; Bicarbonates: 360 mg/L", "Eau", "published"),
        ("Coca-Cola Original", "Coca-Cola", "The Coca-Cola Company", "5449000000996", "33 cl",
         "France", "Boisson rafraichissante aux extraits vegetaux.", "Sucres: 10,6 g/100ml; Cafeine: oui", "Boisson", "published"),
        ("Eau de source Cristaline", "Cristaline", "Roxane", "3274080005003", "1,5 L",
         "France", "Eau de source faiblement mineralisee.", "Calcium: 71 mg/L; Nitrates: 3 mg/L", "Eau", "approved"),
        ("Jus d'orange 100% pur jus", "Tropicana", "PepsiCo", "3800020423456", "1 L",
         "Espagne", "Pur jus d'orange sans sucres ajoutes.", "Vitamine C: 40 mg/100ml; Sucres: 9 g/100ml", "Boisson", "in_review"),
        ("Nutella pate a tartiner", "Nutella", "Ferrero", "3017620422003", "400 g",
         "France", "Pate a tartiner aux noisettes et au cacao.", "Lipides: 31 g/100g; Sucres: 56 g/100g", "Epicerie", "approved"),
        ("Yaourt nature", "Danone", "Danone", "3033490004008", "4 x 125 g",
         "France", "Yaourt nature au lait entier.", "Proteines: 4 g/100g; Calcium: 150 mg", "Frais", "draft"),
        ("Cafe moulu Arabica", "Carte Noire", "Lavazza", "7613034626844", "250 g",
         "Italie", "Cafe moulu 100% Arabica, torrefaction intense.", "Cafeine: oui", "Epicerie", "in_review"),
        ("Gel douche hydratant", "Dove", "Unilever", "8710447256789", "250 ml",
         "Allemagne", "Gel douche creme hydratant a la formule douce.", "pH neutre; Sans savon", "Hygiene", "draft"),
        ("Biscuits sables", "LU", "Mondelez", "7622210449283", "200 g",
         "France", "Biscuits sables purs beurre.", "Lipides: 22 g/100g; Sucres: 24 g/100g", "Epicerie", "draft"),
        ("Lait demi-ecreme", "Lactel", "Lactalis", "3256540001008", "1 L",
         "France", "Lait demi-ecreme UHT.", "Matiere grasse: 1,5%; Calcium: 120 mg/100ml", "Frais", "published"),
        ("Eau petillante San Pellegrino", "San Pellegrino", "Nestle Waters", "8002270150012", "75 cl",
         "Italie", "Eau minerale naturelle gazeuse.", "Calcium: 178 mg/L; Bicarbonates: 219 mg/L", "Eau", "approved"),
        ("Shampoing fortifiant", "L'Oreal", "L'Oreal", "3600523456781", "300 ml",
         "France", "Shampoing fortifiant pour cheveux fragiles.", "Sans paraben", "Hygiene", "draft"),
    ]
    conso_status_channels = {"published": ["ecommerce", "marketplace"]}
    for (nom, marque, fab, ean, cont, pays, desc, comp, cat, statut) in conso:
        p = models.Product(
            sku=f"GP-{ean}", name=nom, family_id=grand.id,
            category_id=cat_by_name[cat].id,
            status=models.ProductStatus(statut),
            channels=conso_status_channels.get(statut, []),
        )
        db.add(p)
        db.flush()
        vals = {
            "marque": marque, "fabricant": fab, "ean": ean, "contenance": cont,
            "pays_origine": pays, "composition": comp,
        }
        for code, value in vals.items():
            db.add(models.AttributeValue(product_id=p.id, attribute_id=gattrs[code].id,
                                         locale="fr", value=value))
        # description localisable FR / EN
        db.add(models.AttributeValue(product_id=p.id, attribute_id=gattrs["description"].id,
                                     locale="fr", value=desc))
        db.add(models.AttributeValue(product_id=p.id, attribute_id=gattrs["description"].id,
                                     locale="en", value=desc))
        db.add(models.Asset(product_id=p.id, type="image",
                            url=f"https://picsum.photos/seed/{ean}/400/400", alt=nom, position=0))
        count += 1

    db.commit()

    # recalcul des scores de completude
    for p in db.query(models.Product).all():
        p.completeness = completeness.compute_completeness(db, p)
    db.commit()
    db.close()
    print(f"Base peuplee : {count} produits, {len(family_objs)} familles, "
          f"{len(cat_objs)} categories, {len(users)} utilisateurs.")


def _fake_value(attr: "models.Attribute", locale: str) -> str:
    t = attr.type
    if t == models.AttributeType.PRICE:
        return f"{random.randint(5, 999)}.99"
    if t == models.AttributeType.NUMBER:
        return str(random.randint(1, 500))
    if t == models.AttributeType.SELECT and attr.options:
        return random.choice(attr.options)
    if t == models.AttributeType.TEXTAREA:
        base = ("Produit de haute qualite concu pour un usage quotidien."
                if locale == "fr"
                else "High quality product designed for everyday use.")
        return base
    if attr.code == "ean":
        return str(random.randint(3000000000000, 3999999999999))
    return f"{attr.label} {random.randint(100, 999)}"


if __name__ == "__main__":
    seed()
