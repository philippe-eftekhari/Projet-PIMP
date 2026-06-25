const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, TableOfContents,
} = require("docx");

const INDIGO = "4338CA", DARK = "1E293B", GREY = "64748B", LINE = "CBD5E1";

const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 },
  children: [new TextRun({ text: t, bold: true, color: INDIGO, size: 30 })] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 100 },
  children: [new TextRun({ text: t, bold: true, color: DARK, size: 24 })] });
const p = (t, opts = {}) => new Paragraph({ spacing: { after: 120, line: 276 }, alignment: AlignmentType.JUSTIFIED,
  children: [new TextRun({ text: t, size: 22, color: "222222", ...opts })] });
const bullet = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 },
  children: [new TextRun({ text: t, size: 22, color: "222222" })] });
const img = (file, w, hgt) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
  children: [new ImageRun({ data: fs.readFileSync(file), transformation: { width: w, height: hgt } })] });
const caption = (t) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
  children: [new TextRun({ text: t, italics: true, size: 18, color: GREY })] });

function cell(text, { bold = false, bg = null, color = "222222", align = AlignmentType.LEFT } = {}) {
  return new TableCell({
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: bg ? { type: ShadingType.CLEAR, fill: bg } : undefined,
    children: [new Paragraph({ alignment: align,
      children: [new TextRun({ text: text, bold, size: 19, color })] })],
  });
}
function table(headers, rows, widths) {
  const headRow = new TableRow({ tableHeader: true,
    children: headers.map((hh) => cell(hh, { bold: true, bg: INDIGO, color: "FFFFFF" })) });
  const bodyRows = rows.map((r, i) => new TableRow({
    children: r.map((c) => cell(c, { bg: i % 2 ? "F1F5F9" : "FFFFFF" })) }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    borders: ["top", "bottom", "left", "right", "insideHorizontal", "insideVertical"].reduce((a, k) => {
      a[k] = { style: BorderStyle.SINGLE, size: 2, color: LINE }; return a; }, {}),
    rows: [headRow, ...bodyRows] });
}

const children = [];

children.push(
  new Paragraph({ spacing: { before: 2600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "PIMP", bold: true, size: 88, color: INDIGO })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Plateforme de Product Information Management", bold: true, size: 36, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 },
    children: [new TextRun({ text: "Document de synthese", size: 26, color: GREY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1400 },
    children: [new TextRun({ text: "Projet dev4pimp25 - INSTA", size: 22, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 },
    children: [new TextRun({ text: "Realise par : Philippe Sam EFTEKHARI - Anass IMLI", size: 22, color: "222222" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 },
    children: [new TextRun({ text: "Encadrant : BM. Bui-Xuan", size: 20, color: GREY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 },
    children: [new TextRun({ text: "Juin 2026", size: 20, color: GREY })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

children.push(
  new Paragraph({ children: [new TextRun({ text: "Sommaire", bold: true, size: 30, color: INDIGO })], spacing: { after: 160 } }),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
);

children.push(h1("1. Introduction et contexte"));
children.push(p("Le Product Information Management (PIM) constitue aujourd'hui un segment strategique du marche des logiciels d'entreprise. Le marche mondial est estime entre 13 et 15 milliards de dollars et pourrait depasser 30 milliards de dollars a l'horizon 2030-2033, porte par une croissance annuelle superieure a 15 %. Deux tendances expliquent cette dynamique : la generalisation des strategies omnicanales et l'explosion du nombre de references produits que les entreprises doivent gerer."));
children.push(p("Un PIM agit comme un referentiel unique de donnees produits (master data) au coeur du systeme d'information retail. Il centralise, structure, enrichit puis diffuse les informations produits (descriptions, attributs, images, traductions, prix) vers l'ensemble des canaux de vente : sites e-commerce, marketplaces, applications mobiles ou catalogues. Dans un contexte ou il faut publier rapidement des milliers de produits sur de multiples points de contact, le PIM devient indispensable pour garantir la coherence et la qualite des donnees et accelerer le time-to-market."));
children.push(p("La principale difficulte pratique d'un PIM n'est pas seulement de stocker la donnee, mais de la faire entrer proprement dans le referentiel. Notre plateforme repond aux deux bouts de la chaine : une porte d'entree intelligente - l'ingestion d'une etiquette produit lue par une IA de vision - et une gestion complete du cycle de vie de la donnee une fois entree (enrichissement, qualite, gouvernance, diffusion)."));
children.push(h2("1.1 Objectifs du projet"));
children.push(p("L'objectif est de concevoir et developper une plateforme de gestion en ligne du PIM repondant aux exigences suivantes :"));
["Centraliser l'ensemble des donnees produits au sein d'un referentiel unique.",
 "Accelerer la saisie grace a une ingestion automatique d'etiquette par IA de vision (human-in-the-loop).",
 "Gerer un catalogue a grande echelle (fort volume d'identifiants produits).",
 "Faciliter l'enrichissement collaboratif des donnees (marketing, achats, fournisseurs).",
 "Assurer la diffusion omnicanale (e-commerce, marketplaces, catalogues, applications mobiles).",
 "Garantir la qualite, la coherence et la completude des informations produits."].forEach((t) => children.push(bullet(t)));
children.push(h2("1.2 Composition de l'equipe"));
children.push(p("Le projet a ete mene par une equipe de deux personnes. Philippe Sam EFTEKHARI a pris en charge le backend, le modele de donnees et l'integration de l'IA de vision ; Anass IMLI a pris en charge le frontend, l'experience utilisateur (design system) et la diffusion omnicanale. La conception, les tests et la redaction des livrables ont ete realises conjointement."));

children.push(h1("2. Analyse fonctionnelle"));
children.push(p("L'analyse des besoins a permis d'identifier cinq grands domaines fonctionnels, traduits ensuite en fonctionnalites concretes de la plateforme."));
children.push(h2("2.1 Ingestion d'etiquette par IA de vision"));
children.push(p("Le point d'entree de la donnee est volontairement simple : un fournisseur depose, par glisser-deposer, la photo d'une etiquette produit. Une IA de vision regarde l'image comme le ferait un humain et en extrait des donnees structurees (nom, marque, fabricant, code EAN, categorie, contenance, pays d'origine, composition). Ce choix d'une IA de vision plutot que d'un OCR classique est determinant : les vraies etiquettes (bouteilles courbees, logos, polices fantaisie, photos prises de travers) sont difficilement lisibles par un OCR ligne a ligne, alors qu'un modele de vision les interprete de facon robuste."));
children.push(p("La fiche pre-remplie n'est jamais enregistree a l'aveugle : elle est presentee a l'utilisateur, qui verifie et corrige les champs avant d'enregistrer. Ce principe human-in-the-loop est essentiel pour un PIM - la qualite de la master data prime sur l'automatisation totale. A l'enregistrement, un upsert sur le code EAN garantit l'absence de doublon : si le produit existe deja, sa fiche est mise a jour plutot que dupliquee."));
children.push(h2("2.2 Gestion du catalogue produit"));
children.push(p("Le coeur du PIM est la fiche produit. Chaque produit est rattache a une famille qui determine la liste de ses attributs. Le modele supporte des attributs dynamiques et types (texte, nombre, prix, booleen, liste de valeurs, date), des familles de produits, une arborescence de categories a n niveaux, ainsi que des relations entre produits (similaires, accessoires, cross-sell) et la notion de variantes. Les produits ingeres via l'IA rejoignent une famille Grande consommation et suivent ensuite le meme cycle de vie que le reste du referentiel."));
children.push(h2("2.3 Gestion des contenus produits"));
children.push(p("La plateforme gere les contenus marketing multilingues : les attributs marques localisables (nom marketing, description) sont saisissables langue par langue (francais, anglais). Les assets digitaux (images, videos, fiches techniques) sont rattaches a chaque produit ; l'etiquette d'origine est conservee et associee a la fiche. La tracabilite des modifications assure un suivi de l'evolution des contenus."));
children.push(h2("2.4 Workflow et gouvernance des donnees"));
children.push(p("Un workflow d'enrichissement structure le cycle de vie d'un produit selon quatre etats : brouillon, en revue, valide, publie. Les transitions sont controlees par des regles metier : un produit ne peut etre soumis a validation qu'au-dela d'un seuil de completude, et seul un data steward (role administrateur) peut valider ou publier. Chaque mouvement est historise. Quatre roles utilisateurs refletent l'organisation reelle : administrateur, marketing, achats et fournisseur."));
children.push(h2("2.5 Diffusion omnicanale"));
children.push(p("Les produits valides sont diffuses vers quatre canaux, chacun recevant une projection adaptee de la donnee : flux JSON enrichi pour l'e-commerce, flux aplati avec champs imposes pour les marketplaces, export CSV pour les catalogues, et flux allege pour l'application mobile. L'adaptation des donnees selon le canal est un apport central d'un PIM."));
children.push(new Paragraph({ children: [new PageBreak()] }));

children.push(h1("3. Solution proposee et choix technologiques"));
children.push(p("La solution est une application web suivant une architecture trois tiers : une interface React (SPA), une API REST developpee avec FastAPI, et une base de donnees relationnelle. Ce decouplage permet de faire evoluer independamment l'interface, la logique metier et le stockage. L'extraction d'etiquette s'execute exclusivement cote serveur, ce qui permet de conserver la cle d'API secrete."));
children.push(h2("3.1 Comparatif des technologies"));
children.push(p("Le tableau ci-dessous justifie les choix retenus au regard des alternatives les plus frequentes du marche."));
children.push(table(
  ["Besoin", "Option retenue", "Alternatives", "Justification"],
  [
    ["API backend", "FastAPI (Python)", "Django, Express, Spring", "Asynchrone et performant, validation native (Pydantic), documentation OpenAPI generee automatiquement, courbe d'apprentissage courte."],
    ["Interface", "React 18 + Vite", "Angular, Vue", "Ecosysteme mature, composants reutilisables, build instantane avec Vite, ideal pour une SPA riche."],
    ["Persistance", "SQLAlchemy + SQLite/PostgreSQL", "MongoDB, ORM Django", "Modele produit fortement relationnel ; SQLite sans configuration en dev, bascule PostgreSQL en production sans changer le code."],
    ["Extraction d'etiquette", "IA de vision (Google Gemini)", "OCR Tesseract, Google Vision OCR", "Lit des etiquettes reelles (bouteilles, logos, photos) la ou un OCR ligne a ligne echoue ; tier gratuit ; renvoie directement du JSON structure."],
    ["Authentification", "JWT (python-jose)", "Sessions, OAuth2", "Sans etat, adapte a une API consommee par une SPA et de futurs canaux externes."],
  ],
  [1700, 2100, 2100, 3500],
));
children.push(new Paragraph({ children: [new PageBreak()] }));

children.push(h1("4. Architecture technique"));
children.push(p("L'application est organisee en trois couches. La couche presentation (React) ne contient aucune logique metier : elle consomme l'API via des appels REST authentifies par jeton JWT. La couche metier (FastAPI) regroupe les routers REST, l'authentification et les roles, le service d'extraction par IA de vision, les moteurs de completude et de workflow, le mapping par canal et la validation des donnees. La couche donnees expose le modele produit via l'ORM SQLAlchemy."));
children.push(img("architecture.png", 560, 354));
children.push(caption("Figure 1 - Architecture trois tiers de la plateforme PIMP"));
children.push(h2("4.1 Le service d'extraction par IA de vision"));
children.push(p("L'extraction est isolee dans un service serveur dedie. L'image recue est encodee puis transmise a un modele de vision (Gemini) accompagne d'une consigne stricte : renvoyer uniquement un objet JSON aux champs attendus. La cle d'API est lue depuis une variable d'environnement (fichier .env) et n'est jamais exposee au frontend ni versionnee. Ce cloisonnement est a la fois une bonne pratique de securite (le secret reste cote serveur) et une bonne pratique d'architecture (l'IA est un detail d'implementation remplacable sans toucher au reste)."));
children.push(h2("4.2 Organisation du code backend"));
children.push(p("Le backend suit une separation claire des responsabilites : models.py (entites ORM), schemas.py (contrats d'entree/sortie Pydantic), un module dedie par preoccupation transverse (auth, completeness, services/extraction), et un router par domaine fonctionnel (ingest, products, categories, workflow, channels, dashboard). Cette structure facilite la maintenance et l'ajout de nouvelles fonctionnalites."));
children.push(new Paragraph({ children: [new PageBreak()] }));

children.push(h1("5. Modele de donnees"));
children.push(p("Le modele place le produit au centre. Une famille definit quels attributs un produit possede ; chaque valeur d'attribut est stockee avec sa langue, ce qui permet le multilingue sans dupliquer les fiches. Les categories forment une arborescence par auto-reference (parent_id). Assets, valeurs et journaux de workflow sont rattaches au produit. Le code EAN, porte par un attribut, sert de cle naturelle anti-doublon lors de l'ingestion."));
children.push(img("datamodel.png", 560, 327));
children.push(caption("Figure 2 - Modele de donnees produit (master data)"));
children.push(h2("5.1 Le moteur de completude"));
children.push(p("La completude d'un produit est calculee de facon transparente et explicable : c'est la proportion des attributs requis de sa famille effectivement renseignes (toutes langues requises confondues), augmentee de la presence d'au moins une image. Le moteur ne se contente pas d'un score : il restitue la liste exacte des champs manquants, ce qui guide concretement l'utilisateur dans l'enrichissement. Ce choix d'une heuristique explicite - plutot qu'un score opaque - est volontaire."));
children.push(new Paragraph({ children: [new PageBreak()] }));

children.push(h1("6. Gestion backend et API"));
children.push(p("L'API expose une trentaine d'endpoints REST documentes automatiquement (Swagger UI accessible sur /docs). Les principales ressources sont presentees ci-dessous."));
children.push(table(
  ["Methode et route", "Role"],
  [
    ["POST /api/auth/login", "Authentification, renvoie un jeton JWT et le role."],
    ["POST /api/ingest/extract", "Lecture de l'etiquette par l'IA de vision ; renvoie la fiche pre-remplie (sans sauvegarde)."],
    ["POST /api/ingest/save", "Enregistre la fiche validee ; upsert sur l'EAN (pas de doublon)."],
    ["GET /api/products", "Liste paginee + recherche (nom/SKU) + filtres (famille, statut)."],
    ["GET /api/products/{id}/completeness", "Score de completude et champs manquants."],
    ["PUT /api/products/{id}", "Enrichissement collaboratif (valeurs d'attributs multilingues)."],
    ["POST /api/products/{id}/transition", "Transition de workflow controlee par role et completude."],
    ["POST /api/channels/{id}/publish", "Publication d'un produit sur un canal."],
    ["GET /api/dashboard", "Indicateurs agreges de pilotage de la qualite."],
  ],
  [4400, 5200],
));
children.push(h2("6.1 Securite et gouvernance"));
children.push(p("Les mots de passe sont stockes haches (bcrypt). Les endpoints sensibles sont proteges par une dependance de controle de role : par exemple, la validation et la publication sont reservees au role administrateur. Les requetes vers la base passent par l'ORM (requetes parametrees, protection contre l'injection SQL). La cle de l'IA de vision reste cote serveur. Cette mecanique illustre la gouvernance des donnees au niveau applicatif."));
children.push(new Paragraph({ children: [new PageBreak()] }));

children.push(h1("7. Diffusion omnicanale"));
children.push(p("Le module de diffusion applique le principe une donnee, plusieurs projections. A partir du referentiel unique, chaque canal recoit une vue specifique de la donnee, ce qui evite de maintenir plusieurs sources de verite."));
children.push(table(
  ["Canal", "Format", "Contenu adapte"],
  [
    ["E-commerce", "JSON enrichi", "Nom, descriptions FR + EN, attributs complets, toutes les images."],
    ["Marketplace", "JSON aplati", "Titre court (80 car.), prix, code EAN, image principale."],
    ["Catalogue", "CSV", "SKU, nom, categorie, prix - pour generation PDF/papier."],
    ["Mobile", "JSON allege", "Champs essentiels et une seule image, pour limiter la charge reseau."],
  ],
  [2200, 2400, 5000],
));

children.push(h1("8. Phase de test et jeu de donnees"));
children.push(p("Un script de peuplement genere un jeu de donnees realiste : environ 610 produits repartis sur 4 familles (dont la famille Grande consommation alimentee par l'ingestion) et une vingtaine de categories, avec des niveaux d'enrichissement volontairement varies afin de rendre le tableau de bord representatif. Ce volume valide le comportement de la pagination et des filtres a l'echelle."));
children.push(p("Les principaux parcours ont ete testes de bout en bout : authentification, ingestion d'etiquette et upsert sur l'EAN, recherche et filtrage du catalogue, calcul de completude avec detail des champs manquants, transitions de workflow avec controle des regles metier (refus si completude insuffisante, refus si role non autorise), et generation des flux par canal. Les tests confirment le bon fonctionnement de chaque endpoint et la coherence des regles de gouvernance."));
children.push(h2("8.1 Resultats observes"));
children.push(p("Sur le jeu de demonstration, la completude moyenne du catalogue est de l'ordre de 39 %, ce qui illustre l'interet du PIM : la plateforme rend immediatement visibles les produits incomplets et oriente l'effort d'enrichissement. La re-ingestion d'une etiquette deja connue met bien a jour la fiche existante sans creer de doublon. Le tableau de bord agrege la repartition par statut, la distribution de completude et le nombre de produits diffuses par canal."));

children.push(h1("9. Gestion de projet"));
children.push(p("Le projet a ete conduit de maniere iterative sur six semaines, en commencant par le modele de donnees - fondation de tout PIM - puis en construisant successivement l'API, les moteurs metier, l'ingestion par IA de vision, l'interface et la diffusion. Le diagramme de Gantt ci-dessous resume la planification et la charge estimee."));
children.push(img("gantt.png", 560, 245));
children.push(caption("Figure 3 - Planning previsionnel et charge (jours-hommes)"));

children.push(h1("10. Conclusion et perspectives"));
children.push(p("La plateforme PIMP demontre, sur un perimetre maitrise, les fonctions essentielles d'un Product Information Management : une porte d'entree intelligente (ingestion d'etiquette par IA de vision avec validation humaine et anti-doublon), un referentiel unique, l'enrichissement collaboratif multilingue, le pilotage de la qualite par la completude, la gouvernance par workflow et roles, et la diffusion omnicanale adaptee par canal. L'architecture trois tiers et la separation nette des responsabilites rendent la solution extensible."));
children.push(p("Plusieurs pistes d'evolution sont identifiees : import/export en masse (CSV, API fournisseurs), extraction par lot de plusieurs etiquettes, gestion fine des droits par attribut, file de syndication temps reel vers les canaux, integration d'un connecteur ERP/e-commerce, et assistance a l'enrichissement (suggestions de traductions ou de descriptions). Ces extensions s'inscrivent naturellement dans l'architecture existante."));

const doc = new Document({
  creator: "Philippe Sam EFTEKHARI & Anass IMLI",
  title: "PIMP - Document de synthese",
  features: { updateFields: true },
  styles: { default: { document: { run: { font: "Calibri" } } } },
  numbering: { config: [] },
  sections: [{
    properties: { page: { margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "PIMP - Plateforme de PIM", size: 16, color: GREY })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Page ", size: 16, color: GREY }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("rapport_synthese.docx", buf);
  console.log("rapport_synthese.docx genere (" + buf.length + " octets)");
});
