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
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: text, bold, size: 19, color })] })],
  });
}
function table(headers, rows, widths) {
  const headRow = new TableRow({ tableHeader: true, children: headers.map((hh) => cell(hh, { bold: true, bg: INDIGO, color: "FFFFFF" })) });
  const bodyRows = rows.map((r, i) => new TableRow({ children: r.map((c) => cell(c, { bg: i % 2 ? "F1F5F9" : "FFFFFF" })) }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: widths,
    borders: ["top", "bottom", "left", "right", "insideHorizontal", "insideVertical"].reduce((a, k) => { a[k] = { style: BorderStyle.SINGLE, size: 2, color: LINE }; return a; }, {}),
    rows: [headRow, ...bodyRows] });
}

const children = [];

// ---- Couverture ----
children.push(
  new Paragraph({ spacing: { before: 2600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PIMP", bold: true, size: 88, color: INDIGO })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Plateforme de Product Information Management", bold: true, size: 36, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: "Document de synthèse", size: 26, color: GREY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1400 }, children: [new TextRun({ text: "Projet dev4pimp25 - INSTA", size: 22, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: "Réalisé par Philippe Sam EFTEKHARI et Anass IMLI", size: 22, color: "222222" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: "Encadrant : BM. Bui-Xuan", size: 20, color: GREY })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: "Juin 2026", size: 20, color: GREY })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---- Sommaire ----
children.push(
  new Paragraph({ children: [new TextRun({ text: "Sommaire", bold: true, size: 30, color: INDIGO })], spacing: { after: 160 } }),
  new TableOfContents("Sommaire", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---- 1. Introduction ----
children.push(h1("1. Introduction et contexte"));
children.push(p("Le Product Information Management (PIM) est aujourd'hui un segment stratégique du marché des logiciels d'entreprise. Le marché mondial est estimé entre 13 et 15 milliards de dollars et pourrait dépasser 30 milliards de dollars à l'horizon 2030-2033, avec une croissance annuelle supérieure à 15 %. Deux tendances expliquent cette dynamique : la généralisation des stratégies omnicanales et l'augmentation rapide du nombre de références que les entreprises doivent gérer."));
children.push(p("Un PIM joue le rôle de référentiel unique des données produits (master data) au sein du système d'information du commerce de détail. Il centralise, structure, enrichit puis diffuse les informations produits (descriptions, attributs, images, traductions, prix) vers tous les canaux de vente : sites e-commerce, marketplaces, applications mobiles ou catalogues. Lorsqu'il faut publier rapidement des milliers de produits sur de nombreux points de contact, le PIM devient indispensable pour garantir la cohérence et la qualité des données et pour réduire le délai de mise sur le marché."));
children.push(p("La difficulté principale d'un PIM ne tient pas seulement au stockage de la donnée, mais à la manière de la faire entrer proprement dans le référentiel. Notre plateforme répond aux deux extrémités de cette chaîne : une porte d'entrée intelligente, l'ingestion d'une étiquette produit lue par une intelligence artificielle de vision, puis une gestion complète du cycle de vie de la donnée une fois entrée (enrichissement, qualité, gouvernance et diffusion)."));
children.push(h2("1.1 Objectifs du projet"));
children.push(p("L'objectif est de concevoir et de développer une plateforme de gestion en ligne d'un PIM répondant aux exigences suivantes :"));
["Centraliser l'ensemble des données produits au sein d'un référentiel unique.",
 "Accélérer la saisie grâce à une ingestion automatique des étiquettes par intelligence artificielle de vision, avec validation humaine.",
 "Gérer un catalogue à grande échelle, capable de supporter un fort volume de références.",
 "Faciliter l'enrichissement collaboratif des données entre les équipes marketing, achats et fournisseurs.",
 "Assurer la diffusion omnicanale vers le e-commerce, les marketplaces, les catalogues et les applications mobiles.",
 "Garantir la qualité, la cohérence et la complétude des informations produits."].forEach((t) => children.push(bullet(t)));
children.push(h2("1.2 Composition de l'équipe"));
children.push(p("Le projet a été mené par une équipe de deux personnes. Philippe Sam EFTEKHARI a pris en charge le backend, le modèle de données et l'intégration de l'intelligence artificielle de vision. Anass IMLI a pris en charge le frontend, l'expérience utilisateur (le système de design) et la diffusion omnicanale. La conception, les tests et la rédaction des livrables ont été réalisés conjointement."));

// ---- 2. Analyse fonctionnelle ----
children.push(h1("2. Analyse fonctionnelle"));
children.push(p("L'analyse des besoins a fait ressortir cinq grands domaines fonctionnels, que nous avons ensuite traduits en fonctionnalités concrètes de la plateforme."));
children.push(h2("2.1 Ingestion d'étiquette par intelligence artificielle de vision"));
children.push(p("Le point d'entrée de la donnée se veut volontairement simple : le fournisseur dépose, par glisser-déposer, la photo d'une étiquette produit. Une intelligence artificielle de vision observe l'image comme le ferait un opérateur humain et en extrait des données structurées (nom, marque, fabricant, code EAN, catégorie, contenance, pays d'origine et composition). Le choix d'une vision par intelligence artificielle plutôt que d'un OCR classique est déterminant : les étiquettes réelles (bouteilles courbées, logos, polices fantaisie, photos prises de biais) restent difficilement lisibles ligne à ligne par un OCR, alors qu'un modèle de vision les interprète de manière fiable."));
children.push(p("La fiche pré-remplie n'est jamais enregistrée sans contrôle : elle est présentée à l'utilisateur, qui vérifie et corrige les champs avant l'enregistrement. Ce principe de validation humaine est essentiel pour un PIM, car la qualité de la donnée maîtresse prime sur l'automatisation intégrale. Au moment de l'enregistrement, une opération de fusion sur le code EAN garantit l'absence de doublon : si le produit existe déjà, sa fiche est mise à jour plutôt que dupliquée."));
children.push(h2("2.2 Gestion du catalogue produit"));
children.push(p("Le cœur du PIM est la fiche produit. Chaque produit est rattaché à une famille qui détermine la liste de ses attributs. Le modèle prend en charge des attributs dynamiques et typés (texte, nombre, prix, booléen, liste de valeurs, date), des familles de produits, une arborescence de catégories sur plusieurs niveaux, des relations entre produits (similaires, accessoires, ventes croisées) ainsi que la notion de variante. Les produits issus de l'ingestion rejoignent une famille « Grande consommation » et suivent ensuite le même cycle de vie que le reste du référentiel."));
children.push(h2("2.3 Gestion des contenus produits"));
children.push(p("La plateforme gère des contenus marketing multilingues : les attributs marqués comme traduisibles (nom marketing, description) se saisissent langue par langue, en français et en anglais. Les ressources numériques (images, vidéos, fiches techniques) sont rattachées à chaque produit, et l'étiquette d'origine est conservée puis associée à la fiche. La traçabilité des modifications permet de suivre l'évolution des contenus."));
children.push(h2("2.4 Workflow et gouvernance des données"));
children.push(p("Un workflow d'enrichissement structure le cycle de vie d'un produit selon quatre états : brouillon, en revue, validé et publié. Les transitions sont encadrées par des règles métier : un produit ne peut être soumis à validation qu'au-delà d'un seuil de complétude, et seul un administrateur (data steward) peut valider ou publier. Chaque mouvement est historisé. Quatre rôles utilisateurs reflètent l'organisation réelle : administrateur, marketing, achats et fournisseur."));
children.push(h2("2.5 Diffusion omnicanale"));
children.push(p("Les produits validés sont diffusés vers quatre canaux, chacun recevant une projection adaptée de la donnée : un flux JSON enrichi pour le e-commerce, un flux aplati aux champs imposés pour les marketplaces, un export CSV pour les catalogues, et un flux allégé pour l'application mobile. Cette adaptation de la donnée selon le canal constitue un apport central d'un PIM."));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 3. Solution & techno ----
children.push(h1("3. Solution proposée et choix technologiques"));
children.push(p("La solution est une application web bâtie sur une architecture à trois niveaux : une interface React (application monopage), une API REST développée avec FastAPI, et une base de données relationnelle. Ce découplage permet de faire évoluer indépendamment l'interface, la logique métier et le stockage. L'extraction des étiquettes s'exécute uniquement côté serveur, ce qui permet de conserver la clé d'API secrète."));
children.push(h2("3.1 Comparatif des technologies"));
children.push(p("Le tableau ci-dessous justifie les choix retenus au regard des alternatives les plus répandues sur le marché."));
children.push(table(
  ["Besoin", "Choix retenu", "Alternatives", "Justification"],
  [
    ["API backend", "FastAPI (Python)", "Django, Express, Spring", "Asynchrone et performant, validation native avec Pydantic, documentation OpenAPI générée automatiquement, prise en main rapide."],
    ["Interface", "React 18 + Vite", "Angular, Vue", "Écosystème mature, composants réutilisables, compilation quasi instantanée avec Vite, adapté à une application monopage riche."],
    ["Persistance", "SQLAlchemy + SQLite ou PostgreSQL", "MongoDB, ORM de Django", "Modèle produit fortement relationnel ; SQLite sans configuration en développement, passage à PostgreSQL en production sans changer le code."],
    ["Extraction d'étiquette", "Vision par IA (Google Gemini)", "OCR Tesseract, Google Vision OCR", "Lit des étiquettes réelles (bouteilles, logos, photos) là où un OCR ligne à ligne échoue ; offre gratuite ; renvoie directement un JSON structuré."],
    ["Authentification", "JWT (python-jose)", "Sessions, OAuth2", "Sans état, adapté à une API consommée par une application monopage et par de futurs canaux externes."],
  ],
  [1700, 2100, 2100, 3500],
));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 4. Architecture ----
children.push(h1("4. Architecture technique"));
children.push(p("L'application s'organise en trois couches. La couche de présentation (React) ne contient aucune logique métier : elle consomme l'API par des appels REST authentifiés à l'aide d'un jeton JWT. La couche métier (FastAPI) regroupe les routes REST, l'authentification et les rôles, le service d'extraction par intelligence artificielle, les moteurs de complétude et de workflow, la projection par canal et la validation des données. La couche de données expose le modèle produit grâce à l'ORM SQLAlchemy."));
children.push(img("architecture.png", 560, 354));
children.push(caption("Figure 1. Architecture à trois niveaux de la plateforme PIMP"));
children.push(h2("4.1 Le service d'extraction par intelligence artificielle"));
children.push(p("L'extraction est isolée dans un service serveur dédié. L'image reçue est encodée puis transmise à un modèle de vision (Gemini), accompagnée d'une consigne stricte qui impose de renvoyer uniquement un objet JSON aux champs attendus. La clé d'API est lue dans une variable d'environnement (fichier .env) ; elle n'est jamais exposée au frontend ni versionnée. Ce cloisonnement répond à la fois à une exigence de sécurité, puisque le secret reste côté serveur, et à un souci d'architecture, puisque l'intelligence artificielle devient un détail d'implémentation remplaçable sans toucher au reste du code."));
children.push(h2("4.2 Organisation du code backend"));
children.push(p("Le backend repose sur une séparation claire des responsabilités : models.py pour les entités de l'ORM, schemas.py pour les contrats d'entrée et de sortie (Pydantic), un module dédié par préoccupation transverse (authentification, complétude, service d'extraction), et une route par domaine fonctionnel (ingestion, produits, catégories, workflow, canaux, tableau de bord). Cette structure facilite la maintenance et l'ajout de nouvelles fonctionnalités."));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 5. Modèle de données ----
children.push(h1("5. Modèle de données"));
children.push(p("Le modèle place le produit au centre. Une famille définit les attributs qu'un produit possède, et chaque valeur d'attribut est stockée avec sa langue, ce qui permet le multilingue sans dupliquer les fiches. Les catégories forment une arborescence par auto-référence (champ parent). Les ressources, les valeurs et les journaux de workflow sont rattachés au produit. Le code EAN, porté par un attribut, sert de clé naturelle pour éviter les doublons lors de l'ingestion."));
children.push(img("datamodel.png", 560, 327));
children.push(caption("Figure 2. Modèle de données produit (master data)"));
children.push(h2("5.1 Le moteur de complétude"));
children.push(p("La complétude d'un produit est calculée de façon transparente et explicable : il s'agit de la proportion des attributs requis de sa famille effectivement renseignés (toutes langues requises confondues), à laquelle s'ajoute la présence d'au moins une image. Le moteur ne se contente pas d'un score : il restitue la liste exacte des champs manquants, ce qui guide concrètement l'utilisateur dans l'enrichissement. Nous avons délibérément préféré une heuristique explicite à un score opaque."));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 6. Backend / API ----
children.push(h1("6. Gestion du backend et de l'API"));
children.push(p("L'API expose une trentaine de routes REST, documentées automatiquement (l'interface Swagger est accessible sur /docs). Les principales ressources sont présentées ci-dessous."));
children.push(table(
  ["Méthode et route", "Rôle"],
  [
    ["POST /api/auth/login", "Authentification ; renvoie un jeton JWT et le rôle de l'utilisateur."],
    ["POST /api/ingest/extract", "Lecture de l'étiquette par l'IA de vision ; renvoie la fiche pré-remplie sans l'enregistrer."],
    ["POST /api/ingest/save", "Enregistre la fiche validée ; fusion sur le code EAN pour éviter les doublons."],
    ["GET /api/products", "Liste paginée, recherche par nom ou SKU, filtres par famille et par statut."],
    ["GET /api/products/{id}/completeness", "Score de complétude et liste des champs manquants."],
    ["PUT /api/products/{id}", "Enrichissement collaboratif (valeurs d'attributs multilingues)."],
    ["POST /api/products/{id}/transition", "Transition de workflow contrôlée par le rôle et la complétude."],
    ["POST /api/channels/{id}/publish", "Publication d'un produit sur un canal."],
    ["GET /api/dashboard", "Indicateurs agrégés de pilotage de la qualité."],
  ],
  [4400, 5200],
));
children.push(h2("6.1 Sécurité et gouvernance"));
children.push(p("Les mots de passe sont stockés sous forme hachée (bcrypt). Les routes sensibles sont protégées par un contrôle de rôle : la validation et la publication, par exemple, sont réservées à l'administrateur. Les requêtes vers la base passent par l'ORM, avec des requêtes paramétrées qui protègent contre l'injection SQL. La clé de l'intelligence artificielle de vision demeure côté serveur. Cet ensemble illustre la gouvernance des données au niveau applicatif."));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 7. Diffusion ----
children.push(h1("7. Diffusion omnicanale"));
children.push(p("Le module de diffusion applique le principe « une donnée, plusieurs projections ». À partir du référentiel unique, chaque canal reçoit une vue qui lui est propre, ce qui évite d'entretenir plusieurs sources de vérité."));
children.push(table(
  ["Canal", "Format", "Contenu adapté"],
  [
    ["E-commerce", "JSON enrichi", "Nom, descriptions en français et en anglais, attributs complets, toutes les images."],
    ["Marketplace", "JSON aplati", "Titre court (80 caractères), prix, code EAN, image principale."],
    ["Catalogue", "CSV", "SKU, nom, catégorie et prix, pour la génération d'un catalogue papier ou PDF."],
    ["Mobile", "JSON allégé", "Champs essentiels et une seule image, afin de limiter la charge réseau."],
  ],
  [2200, 2400, 5000],
));

// ---- 8. Tests ----
children.push(h1("8. Phase de test et jeu de données"));
children.push(p("Un script de peuplement génère un jeu de données réaliste : environ 610 produits répartis sur quatre familles (dont la famille « Grande consommation », alimentée par l'ingestion) et une vingtaine de catégories, avec des niveaux d'enrichissement volontairement variés afin de rendre le tableau de bord représentatif. Ce volume valide le comportement de la pagination et des filtres à l'échelle."));
children.push(p("Les principaux parcours ont été testés de bout en bout : l'authentification, l'ingestion d'une étiquette et la fusion sur le code EAN, la recherche et le filtrage du catalogue, le calcul de complétude avec le détail des champs manquants, les transitions de workflow avec le contrôle des règles métier (refus si la complétude est insuffisante, refus si le rôle n'est pas autorisé), et la génération des flux par canal. Les tests confirment le bon fonctionnement de chaque route ainsi que la cohérence des règles de gouvernance."));
children.push(h2("8.1 Résultats observés"));
children.push(p("Sur le jeu de démonstration, la complétude moyenne du catalogue est de l'ordre de 39 %, ce qui illustre l'intérêt du PIM : la plateforme rend immédiatement visibles les produits incomplets et oriente l'effort d'enrichissement. Ré-ingérer une étiquette déjà connue met bien à jour la fiche existante, sans créer de doublon. Le tableau de bord agrège la répartition par statut, la distribution de la complétude et le nombre de produits diffusés par canal."));

// ---- 9. Gestion de projet ----
children.push(h1("9. Gestion de projet"));
children.push(p("Le projet a été conduit de façon itérative sur six semaines. Nous avons commencé par le modèle de données, fondation de tout PIM, puis nous avons construit successivement l'API, les moteurs métier, l'ingestion par intelligence artificielle, l'interface et la diffusion. Le diagramme de Gantt ci-dessous résume la planification et la charge estimée."));
children.push(img("gantt.png", 560, 245));
children.push(caption("Figure 3. Planning prévisionnel et charge (jours-hommes)"));

// ---- 10. Conclusion ----
children.push(h1("10. Conclusion et perspectives"));
children.push(p("La plateforme PIMP démontre, sur un périmètre maîtrisé, les fonctions essentielles d'un Product Information Management : une porte d'entrée intelligente (l'ingestion d'étiquette par vision, avec validation humaine et prévention des doublons), un référentiel unique, l'enrichissement collaboratif multilingue, le pilotage de la qualité par la complétude, la gouvernance par workflow et par rôles, et la diffusion omnicanale adaptée à chaque canal. L'architecture à trois niveaux et la séparation nette des responsabilités rendent la solution extensible."));
children.push(p("Plusieurs pistes d'évolution se dégagent : l'import et l'export en masse (CSV, API fournisseurs), l'extraction par lot de plusieurs étiquettes, la gestion fine des droits attribut par attribut, une file de syndication en temps réel vers les canaux, l'intégration d'un connecteur ERP ou e-commerce, et une assistance à l'enrichissement (suggestions de traductions ou de descriptions). Ces extensions s'inscrivent naturellement dans l'architecture existante."));

const doc = new Document({
  creator: "Philippe Sam EFTEKHARI et Anass IMLI",
  title: "PIMP - Document de synthèse",
  features: { updateFields: true },
  styles: { default: { document: { run: { font: "Calibri" } } } },
  numbering: { config: [] },
  sections: [{
    properties: { page: { margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "PIMP - Plateforme de PIM", size: 16, color: GREY })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync("rapport_synthese.docx", buf); console.log("OK", buf.length, "octets"); });
