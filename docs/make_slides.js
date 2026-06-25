const pptx = require("pptxgenjs");
const p = new pptx();
p.layout = "LAYOUT_WIDE";
p.author = "Philippe Sam EFTEKHARI & Anass IMLI";
p.title = "PIMP - Plateforme de PIM";

const W = 13.3, H = 7.5;
const NAVY = "1E2761", IND = "6366F1", IND2 = "818CF8", ICE = "CADCFC",
      WHITE = "FFFFFF", DARK = "1E293B", GREY = "64748B", LIGHT = "F8FAFC",
      GREEN = "10B981", AMBER = "F59E0B", BLUE = "3B82F6", LINE = "E2E8F0";
const HF = "Georgia", BF = "Calibri";

let n = 0;
function pageNum(s, dark) {
  n++;
  s.addText(String(n).padStart(2, "0"), { x: W - 0.9, y: H - 0.5, w: 0.6, h: 0.3,
    fontSize: 10, color: dark ? ICE : GREY, align: "right", fontFace: BF });
}
function tag(s, text, color) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 0.55, w: 2.6, h: 0.42,
    fill: { color: color || IND }, rectRadius: 0.21 });
  s.addText(text.toUpperCase(), { x: 0.7, y: 0.55, w: 2.6, h: 0.42, fontSize: 11,
    color: WHITE, bold: true, align: "center", valign: "middle", charSpacing: 2, fontFace: BF });
}
const SECT = { "Introduction": IND, "Demonstration": GREEN, "Technique": BLUE };
function content(tagText, title) {
  const s = p.addSlide();
  s.background = { color: LIGHT };
  const col = SECT[tagText] || IND;
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: col } });
  tag(s, tagText, col);
  s.addText(title, { x: 0.7, y: 1.05, w: W - 1.4, h: 0.8, fontSize: 28, bold: true, color: NAVY, fontFace: HF });
  s.addShape(p.shapes.LINE, { x: 0.7, y: 1.82, w: 2.2, h: 0, line: { color: col, width: 2.5 } });
  pageNum(s, false);
  return s;
}
function card(s, x, y, w, h, opts = {}) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: opts.fill || WHITE },
    line: { color: opts.line || LINE, width: 1 }, rectRadius: 0.08,
    shadow: { type: "outer", color: "94A3B8", blur: 6, offset: 2, angle: 135, opacity: 0.18 } });
}
function imageSlide(tagText, title, file, wpx, hpx, caption) {
  const s = content(tagText, title);
  const ratio = hpx / wpx;
  let h = caption ? 4.4 : 4.7, w = h / ratio;
  if (w > 11.7) { w = 11.7; h = w * ratio; }
  s.addImage({ path: file, x: (W - w) / 2, y: 2.1, w, h });
  if (caption) s.addText(caption, { x: 0.7, y: 6.55, w: W - 1.4, h: 0.5, fontSize: 13,
    italic: true, color: GREY, align: "center", fontFace: BF });
  return s;
}

// 1. TITLE
let s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.OVAL, { x: 9.5, y: -2.2, w: 6, h: 6, fill: { color: IND, transparency: 65 } });
s.addShape(p.shapes.OVAL, { x: 11, y: 4.5, w: 4.5, h: 4.5, fill: { color: IND2, transparency: 75 } });
s.addText("PIMP", { x: 0.9, y: 1.9, w: 8, h: 1.4, fontSize: 80, bold: true, color: WHITE, fontFace: HF });
s.addText("Plateforme de Product Information Management", { x: 0.95, y: 3.3, w: 11, h: 0.7, fontSize: 24, color: ICE, fontFace: BF });
s.addShape(p.shapes.LINE, { x: 1.0, y: 4.15, w: 3, h: 0, line: { color: IND2, width: 3 } });
s.addText([
  { text: "Projet dev4pimp25 - INSTA", options: { breakLine: true, fontSize: 16, color: WHITE } },
  { text: "Philippe Sam EFTEKHARI  -  Anass IMLI", options: { breakLine: true, fontSize: 14, color: ICE } },
  { text: "Encadrant : BM. Bui-Xuan  -  Juin 2026", options: { fontSize: 14, color: ICE } },
], { x: 1.0, y: 4.4, w: 9, h: 1.5, fontFace: BF, lineSpacingMultiple: 1.3 });

// 2. SOMMAIRE
s = content("Sommaire", "Deroule de la presentation");
const agenda = [
  ["1", "Introduction", "Equipe . marche . objectif . solution . technologies . planning", IND, "5 min"],
  ["2", "Demonstration", "Ingestion IA . plateforme . utilisateurs . bilan de developpement", GREEN, "2-3 min"],
  ["3", "Partie technique", "Architecture . extraction IA . donnees . backend . tests . CI/CD", BLUE, "10-15 min"],
];
agenda.forEach((a, i) => {
  const y = 2.25 + i * 1.45;
  card(s, 0.7, y, 11.9, 1.2);
  s.addShape(p.shapes.OVAL, { x: 1.0, y: y + 0.26, w: 0.68, h: 0.68, fill: { color: a[3] } });
  s.addText(a[0], { x: 1.0, y: y + 0.26, w: 0.68, h: 0.68, fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: HF });
  s.addText(a[1], { x: 1.95, y: y + 0.16, w: 8, h: 0.5, fontSize: 19, bold: true, color: NAVY, fontFace: BF });
  s.addText(a[2], { x: 1.95, y: y + 0.6, w: 9, h: 0.5, fontSize: 13, color: GREY, fontFace: BF });
  s.addText(a[4], { x: 10.6, y: y + 0.35, w: 1.8, h: 0.5, fontSize: 14, bold: true, color: a[3], align: "right", fontFace: BF });
});

// 3. EQUIPE & OBJECTIF
s = content("Introduction", "Equipe & objectif du projet");
card(s, 0.7, 2.1, 5.6, 4.5, { fill: NAVY, line: NAVY });
s.addText("L'equipe", { x: 1.0, y: 2.35, w: 5, h: 0.5, fontSize: 18, bold: true, color: ICE, fontFace: BF });
s.addText([
  { text: "Philippe Sam EFTEKHARI", options: { breakLine: true, bold: true, fontSize: 16, color: WHITE } },
  { text: "Backend . modele de donnees . IA de vision", options: { breakLine: true, fontSize: 13, color: ICE } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Anass IMLI", options: { breakLine: true, bold: true, fontSize: 16, color: WHITE } },
  { text: "Frontend . design system . diffusion", options: { fontSize: 13, color: ICE } },
], { x: 1.0, y: 3.0, w: 5, h: 3, fontFace: BF, lineSpacingMultiple: 1.2 });
card(s, 6.6, 2.1, 5.9, 4.5);
s.addText("Objectif", { x: 6.9, y: 2.35, w: 5, h: 0.5, fontSize: 18, bold: true, color: IND, fontFace: BF });
s.addText("Concevoir une plateforme web de Product Information Management : une porte d'entree intelligente (ingestion d'etiquette par IA) et un referentiel unique enrichi puis diffuse vers tous les canaux.",
  { x: 6.9, y: 2.95, w: 5.3, h: 1.5, fontSize: 15, color: DARK, fontFace: BF, lineSpacingMultiple: 1.25 });
s.addText([
  { text: "Ingestion d'etiquette par IA de vision", options: { bullet: true, breakLine: true } },
  { text: "Centraliser (referentiel unique)", options: { bullet: true, breakLine: true } },
  { text: "Enrichissement collaboratif multilingue", options: { bullet: true, breakLine: true } },
  { text: "Gouvernance par workflow et roles", options: { bullet: true, breakLine: true } },
  { text: "Diffusion omnicanale", options: { bullet: true } },
], { x: 6.9, y: 4.5, w: 5.3, h: 2.0, fontSize: 14, color: NAVY, fontFace: BF, lineSpacingMultiple: 1.2 });

// 4. MARCHE & BESOINS
s = content("Introduction", "Le marche du PIM & les besoins");
const stats = [["13-15 Mds $", "Marche mondial actuel", IND], ["> 30 Mds $", "Projection 2030-2033", GREEN], ["> 15 %", "Croissance annuelle", AMBER]];
stats.forEach((st, i) => {
  const x = 0.7 + i * 4.0;
  card(s, x, 2.15, 3.6, 1.65);
  s.addText(st[0], { x, y: 2.35, w: 3.6, h: 0.8, fontSize: 30, bold: true, color: st[2], align: "center", fontFace: HF });
  s.addText(st[1], { x: x + 0.2, y: 3.2, w: 3.2, h: 0.5, fontSize: 13, color: GREY, align: "center", fontFace: BF });
});
const needs = [["Faire entrer la donnee", "ingestion automatique"], ["Centraliser", "referentiel unique"], ["Passer a l'echelle", "fort volume de SKU"], ["Enrichir a plusieurs", "marketing, achats, fournisseurs"], ["Diffuser partout", "e-commerce, marketplace, mobile"], ["Garantir la qualite", "coherence & completude"]];
needs.forEach((nd, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.7 + col * 4.0, y = 4.1 + row * 1.15;
  const w = 3.7;
  card(s, x, y, w, 1.0);
  s.addShape(p.shapes.OVAL, { x: x + 0.18, y: y + 0.28, w: 0.44, h: 0.44, fill: { color: IND } });
  s.addText(String(i + 1), { x: x + 0.18, y: y + 0.28, w: 0.44, h: 0.44, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: HF });
  s.addText(nd[0], { x: x + 0.75, y: y + 0.16, w: w - 0.85, h: 0.4, fontSize: 14, bold: true, color: NAVY, fontFace: BF });
  s.addText(nd[1], { x: x + 0.75, y: y + 0.55, w: w - 0.85, h: 0.35, fontSize: 11.5, color: GREY, fontFace: BF });
});

// 5. SOLUTION
s = content("Introduction", "La solution : application web 3-tiers");
const layers = [
  ["Frontend - React 18 + Vite", "Interface SPA : ingestion, catalogue, editeur, diffusion", IND],
  ["Backend - FastAPI (Python)", "API REST . IA de vision (Gemini) . completude & workflow . mapping canal", GREEN],
  ["Donnees - SQLAlchemy . SQLite/PostgreSQL", "Referentiel produit (master data) relationnel", AMBER],
];
layers.forEach((l, i) => {
  const y = 2.35 + i * 1.4;
  card(s, 1.5, y, 10.3, 1.15, { line: l[2] });
  s.addShape(p.shapes.RECTANGLE, { x: 1.5, y, w: 0.14, h: 1.15, fill: { color: l[2] } });
  s.addText(l[0], { x: 1.9, y: y + 0.18, w: 9.5, h: 0.45, fontSize: 17, bold: true, color: NAVY, fontFace: BF });
  s.addText(l[1], { x: 1.9, y: y + 0.62, w: 9.5, h: 0.4, fontSize: 13, color: GREY, fontFace: BF });
  if (i < 2) s.addText("flux", { x: 6.5, y: y + 1.12, w: 0.6, h: 0.3, fontSize: 10, color: GREY, align: "center" });
});

// 6. CHOIX TECHNO
s = content("Introduction", "Choix technologiques justifies");
const rows = [
  ["Backend", "FastAPI", "Django / Express / Spring", "Async, validation Pydantic, doc OpenAPI auto"],
  ["Frontend", "React 18 + Vite", "Angular / Vue", "Composants, build instantane, SPA riche"],
  ["Donnees", "SQLAlchemy", "MongoDB", "Relationnel, SQLite->PostgreSQL sans refonte"],
  ["Extraction", "IA vision (Gemini)", "OCR Tesseract / Vision OCR", "Lit les vraies etiquettes ; JSON structure ; gratuit"],
  ["Auth", "JWT", "Sessions / OAuth2", "Sans etat, adapte API + SPA + canaux externes"],
];
const tbl = [["Besoin", "Choix", "Alternatives", "Justification"].map(t => ({ text: t, options: { bold: true, color: WHITE, fill: NAVY } }))];
rows.forEach((r, i) => {
  const bg = i % 2 ? "EEF2FF" : WHITE;
  tbl.push([
    { text: r[0], options: { bold: true, color: NAVY, fill: bg } },
    { text: r[1], options: { bold: true, color: IND, fill: bg } },
    { text: r[2], options: { color: GREY, fill: bg } },
    { text: r[3], options: { color: DARK, fill: bg } },
  ]);
});
s.addTable(tbl, { x: 0.7, y: 2.3, w: 11.9, colW: [1.8, 2.2, 3.0, 4.9], fontSize: 13, fontFace: BF,
  border: { type: "solid", color: LINE, pt: 1 }, rowH: 0.7, valign: "middle", margin: 6 });

// 7. GANTT
imageSlide("Introduction", "Gestion de projet & charge", "gantt.png", 960, 420,
  "Approche iterative sur 6 semaines . charge estimee ~41 jours-hommes (equipe de 2)");

// 8. INGESTION PAR IA (demonstration - fonctionnalite phare)
s = content("Demonstration", "Fonctionnalite phare : ingestion par IA de vision");
const flow = [
  ["1. Depot", "Le fournisseur glisse la photo d'une etiquette (JPG/PNG)", IND],
  ["2. Lecture IA", "Un modele de vision (Gemini) lit l'image et renvoie du JSON", GREEN],
  ["3. Revue humaine", "La fiche pre-remplie est verifiee et corrigee (human-in-the-loop)", AMBER],
  ["4. Upsert EAN", "Enregistrement : mise a jour si l'EAN existe, sinon creation", BLUE],
];
flow.forEach((f, i) => {
  const y = 2.25 + i * 1.05;
  card(s, 0.9, y, 11.5, 0.9, { line: f[2] });
  s.addShape(p.shapes.RECTANGLE, { x: 0.9, y, w: 0.14, h: 0.9, fill: { color: f[2] } });
  s.addText(f[0], { x: 1.25, y: y + 0.1, w: 3.1, h: 0.7, fontSize: 16, bold: true, color: NAVY, valign: "middle", fontFace: BF });
  s.addText(f[1], { x: 4.4, y: y + 0.1, w: 7.8, h: 0.7, fontSize: 13.5, color: GREY, valign: "middle", fontFace: BF });
});
s.addText("Pourquoi une IA de vision plutot qu'un OCR : les vraies etiquettes (bouteilles courbees, logos, photos) ne sont pas lisibles par un OCR ligne a ligne.",
  { x: 0.9, y: 6.55, w: 11.5, h: 0.5, fontSize: 13, italic: true, color: GREY, align: "center", fontFace: BF });

// 9. CAS D'UTILISATION
imageSlide("Demonstration", "Cas d'utilisation & acteurs", "diagrams/01_cas_utilisation.png", 1000, 660,
  "4 acteurs internes + le canal externe ; la validation/publication est reservee a l'administrateur");

// 10. UTILISATEURS & ROLES
s = content("Demonstration", "Les utilisateurs et leurs roles");
const roles = [
  ["Administrateur", "Data steward : valide, publie, gere le referentiel", IND],
  ["Marketing", "Descriptions, traductions, contenus", GREEN],
  ["Achats", "Prix, fournisseurs, donnees commerciales", AMBER],
  ["Fournisseur", "Depot d'etiquettes, donnees techniques", BLUE],
];
roles.forEach((r, i) => {
  const x = 0.7 + i * 3.0;
  card(s, x, 2.4, 2.75, 3.0);
  s.addShape(p.shapes.OVAL, { x: x + 0.95, y: 2.7, w: 0.85, h: 0.85, fill: { color: r[2] } });
  s.addText(r[0][0], { x: x + 0.95, y: 2.7, w: 0.85, h: 0.85, fontSize: 28, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: HF });
  s.addText(r[0], { x: x + 0.1, y: 3.8, w: 2.55, h: 0.5, fontSize: 16, bold: true, color: NAVY, align: "center", fontFace: BF });
  s.addText(r[1], { x: x + 0.2, y: 4.3, w: 2.35, h: 1.0, fontSize: 12.5, color: GREY, align: "center", fontFace: BF });
});
s.addText("Gouvernance par roles (RBAC) reproduisant l'organisation reelle de l'enrichissement collaboratif.",
  { x: 0.7, y: 5.8, w: 11.9, h: 0.5, fontSize: 14, italic: true, color: GREY, align: "center", fontFace: BF });

// 11. PARCOURS / FONCTIONNALITES
s = content("Demonstration", "Parcours & fonctionnalites cles");
const steps = [
  ["Ingestion", "Depot d'etiquette -> extraction IA -> fiche pre-remplie"],
  ["Catalogue", "Recherche, filtres et pagination (~610 produits)"],
  ["Editeur produit", "Attributs dynamiques, langues FR/EN, medias"],
  ["Completude", "Score en temps reel + liste des champs manquants"],
  ["Workflow", "Soumettre -> valider -> publier, avec controles"],
  ["Diffusion", "Apercu des flux adaptes a chaque canal"],
];
steps.forEach((st, i) => {
  const y = 2.15 + i * 0.72;
  card(s, 0.9, y, 8.0, 0.62);
  s.addShape(p.shapes.OVAL, { x: 1.1, y: y + 0.08, w: 0.46, h: 0.46, fill: { color: IND } });
  s.addText(String(i + 1), { x: 1.1, y: y + 0.08, w: 0.46, h: 0.46, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: HF });
  s.addText(st[0], { x: 1.75, y: y + 0.05, w: 2.6, h: 0.52, fontSize: 14, bold: true, color: NAVY, valign: "middle", fontFace: BF });
  s.addText(st[1], { x: 4.3, y: y + 0.05, w: 4.5, h: 0.52, fontSize: 11.5, color: GREY, valign: "middle", fontFace: BF });
});
card(s, 9.2, 2.15, 3.3, 4.3, { fill: "FEF3C7", line: AMBER });
s.addText("A inserer ici", { x: 9.4, y: 2.4, w: 2.9, h: 0.4, fontSize: 13, bold: true, color: "92400E", fontFace: BF });
s.addText("Captures d'ecran de la plateforme (ingestion, tableau de bord, fiche produit, diffusion).",
  { x: 9.4, y: 2.85, w: 2.9, h: 3.0, fontSize: 13, color: "92400E", fontFace: BF, lineSpacingMultiple: 1.2 });

// 12. BILAN DEV
s = content("Demonstration", "Enseignements de la phase de developpement");
const lessons = [
  ["La porte d'entree d'abord", "Faire entrer la donnee proprement (ingestion IA + revue humaine) est aussi important que la stocker."],
  ["Qualite explicable, pas magique", "Un score de completude qui liste les champs manquants est plus utile qu'un indicateur opaque."],
  ["Decouplage front / back", "L'API REST + JWT et l'IA isolee dans un service permettent de faire evoluer chaque brique independamment."],
];
lessons.forEach((l, i) => {
  const y = 2.3 + i * 1.45;
  card(s, 0.7, y, 11.8, 1.25);
  s.addShape(p.shapes.RECTANGLE, { x: 0.7, y, w: 0.14, h: 1.25, fill: { color: GREEN } });
  s.addText(l[0], { x: 1.05, y: y + 0.18, w: 11, h: 0.45, fontSize: 17, bold: true, color: NAVY, fontFace: BF });
  s.addText(l[1], { x: 1.05, y: y + 0.62, w: 11.2, h: 0.55, fontSize: 13.5, color: GREY, fontFace: BF });
});

// 13. ARCHITECTURE
imageSlide("Technique", "Architecture trois tiers", "architecture.png", 980, 620,
  "Presentation (React) . Metier (FastAPI + IA de vision) . Donnees (SQLAlchemy) - couplage faible par API REST/JWT");

// 14. EXTRACTION PAR IA (technique)
s = content("Technique", "Extraction par IA de vision (Gemini)");
card(s, 0.7, 2.3, 5.7, 4.2);
s.addText("Principe", { x: 1.0, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText([
  { text: "Image encodee en base64 cote serveur", options: { bullet: true, breakLine: true } },
  { text: "Envoi au modele de vision avec un prompt strict", options: { bullet: true, breakLine: true } },
  { text: "Reponse imposee en JSON (responseMimeType)", options: { bullet: true, breakLine: true } },
  { text: "Cle API lue dans .env, jamais exposee au front", options: { bullet: true, breakLine: true } },
  { text: "IA remplacable sans toucher au reste du code", options: { bullet: true } },
], { x: 1.0, y: 3.1, w: 5.2, h: 3.2, fontSize: 14, color: DARK, fontFace: BF, lineSpacingMultiple: 1.35 });
card(s, 6.6, 2.3, 5.9, 4.2);
s.addText("Sortie structuree (exemple)", { x: 6.9, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText('{\n  "nom_produit": "Evian 1,5 L",\n  "marque": "Evian",\n  "ean": "3068320123456",\n  "categorie": "Eau",\n  "contenance": "1,5 L",\n  "pays_origine": "France",\n  "composition": [\n    {"libelle":"Calcium","valeur":"80 mg/L"}\n  ]\n}',
  { x: 6.9, y: 3.05, w: 5.4, h: 3.2, fontSize: 12, color: DARK, fontFace: "Consolas", lineSpacingMultiple: 1.1 });

// 15. DEPLOIEMENT
imageSlide("Technique", "Architecture de deploiement", "diagrams/06_deploiement.png", 1000, 620,
  "Conteneurs Docker : nginx (frontend + reverse proxy), API FastAPI, base en volume persistant");

// 16. MCD MERISE
imageSlide("Technique", "Modele de donnees (MCD Merise)", "diagrams/05_mcd_merise.png", 1120, 800,
  "L'association valorise porte valeur + langue -> table AttributeValue dans le MLD (multilingue natif)");

// 17. BACKEND & API
s = content("Technique", "Backend & API REST");
card(s, 0.7, 2.3, 5.7, 4.2);
s.addText("Organisation du code", { x: 1.0, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText([
  { text: "models.py - entites ORM", options: { bullet: true, breakLine: true } },
  { text: "schemas.py - contrats Pydantic", options: { bullet: true, breakLine: true } },
  { text: "auth.py - JWT & roles (RBAC)", options: { bullet: true, breakLine: true } },
  { text: "services/extraction.py - IA de vision", options: { bullet: true, breakLine: true } },
  { text: "routers/ - un par domaine (dont ingest)", options: { bullet: true } },
], { x: 1.0, y: 3.1, w: 5.2, h: 3.2, fontSize: 14.5, color: DARK, fontFace: "Consolas", lineSpacingMultiple: 1.35 });
card(s, 6.6, 2.3, 5.9, 4.2);
s.addText("Endpoints principaux", { x: 6.9, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText([
  { text: "POST /auth/login", options: { breakLine: true, color: GREEN, bold: true } },
  { text: "POST /ingest/extract  (IA de vision)", options: { breakLine: true, color: GREEN, bold: true } },
  { text: "POST /ingest/save  (upsert EAN)", options: { breakLine: true, color: AMBER, bold: true } },
  { text: "GET  /products  (filtres + pagination)", options: { breakLine: true, color: NAVY } },
  { text: "GET  /products/{id}/completeness", options: { breakLine: true, color: NAVY } },
  { text: "POST /products/{id}/transition", options: { breakLine: true, color: AMBER, bold: true } },
  { text: "POST /channels/{id}/publish", options: { breakLine: true, color: NAVY } },
  { text: "GET  /dashboard", options: { color: NAVY } },
], { x: 6.9, y: 3.05, w: 5.4, h: 3.3, fontSize: 12.5, fontFace: "Consolas", lineSpacingMultiple: 1.3 });

// 18. COMPLETUDE
s = content("Technique", "Moteur de qualite : la completude");
card(s, 0.7, 2.3, 11.8, 1.6, { fill: NAVY, line: NAVY });
s.addText("Completude = part des attributs requis renseignes (toutes langues requises) + au moins une image",
  { x: 1.1, y: 2.5, w: 11, h: 0.9, fontSize: 17, bold: true, color: WHITE, fontFace: BF, valign: "middle", lineSpacingMultiple: 1.2 });
s.addText("Heuristique transparente : le moteur restitue la LISTE exacte des champs manquants.",
  { x: 1.1, y: 3.35, w: 11, h: 0.4, fontSize: 13, color: ICE, italic: true, fontFace: BF });
card(s, 0.7, 4.2, 5.7, 2.2);
s.addText("Exemple de sortie", { x: 1.0, y: 4.4, w: 5, h: 0.4, fontSize: 14, bold: true, color: IND, fontFace: BF });
s.addText('{ "score": 28.6,\n  "filled": 2, "total": 7,\n  "missing": ["Description (fr)",\n    "Description (en)", "Code EAN"] }',
  { x: 1.0, y: 4.85, w: 5.2, h: 1.4, fontSize: 12, color: DARK, fontFace: "Consolas", lineSpacingMultiple: 1.1 });
card(s, 6.6, 4.2, 5.9, 2.2);
s.addText("Pourquoi c'est utile", { x: 6.9, y: 4.4, w: 5, h: 0.4, fontSize: 14, bold: true, color: IND, fontFace: BF });
s.addText("Le tableau de bord agrege ces scores (completude moyenne, distribution, produits incomplets) : l'effort d'enrichissement est priorise objectivement, meme sur des produits deja valides.",
  { x: 6.9, y: 4.85, w: 5.4, h: 1.4, fontSize: 13.5, color: DARK, fontFace: BF, lineSpacingMultiple: 1.2 });

// 19. WORKFLOW & GOUVERNANCE
s = content("Technique", "Workflow & gouvernance");
const wf = [["Brouillon", "475569"], ["En revue", AMBER], ["Valide", GREEN], ["Publie", BLUE]];
wf.forEach((w2, i) => {
  const x = 0.9 + i * 3.05;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.5, w: 2.4, h: 0.9, fill: { color: w2[1] }, rectRadius: 0.1 });
  s.addText(w2[0], { x, y: 2.5, w: 2.4, h: 0.9, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: BF });
  if (i < 3) s.addText(">", { x: x + 2.4, y: 2.5, w: 0.65, h: 0.9, fontSize: 24, color: GREY, align: "center", valign: "middle" });
});
const ru = [
  "Soumission a validation refusee si completude < 60 %",
  "Seul l'administrateur (data steward) peut valider et publier",
  "Chaque transition est historisee (auteur, date, commentaire)",
];
ru.forEach((r, i) => {
  const y = 3.9 + i * 0.9;
  card(s, 1.5, y, 10.3, 0.75);
  s.addShape(p.shapes.OVAL, { x: 1.75, y: y + 0.18, w: 0.4, h: 0.4, fill: { color: IND } });
  s.addText("v", { x: 1.75, y: y + 0.18, w: 0.4, h: 0.4, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
  s.addText(r, { x: 2.35, y, w: 9.3, h: 0.75, fontSize: 15, color: DARK, valign: "middle", fontFace: BF });
});

// 20. ACTIVITE WORKFLOW
imageSlide("Technique", "Diagramme d'activite - cycle de vie", "diagrams/04_activite_workflow.png", 900, 720,
  "Le produit ne progresse que si les regles de completude et de role sont satisfaites");

// 21. SEQUENCE ENRICHISSEMENT
imageSlide("Technique", "Sequence - enrichissement d'un produit", "diagrams/02_sequence_enrichissement.png", 1000, 640,
  "La completude est recalculee cote serveur a chaque modification de valeur ou d'image");

// 22. SEQUENCE VALIDATION
imageSlide("Technique", "Sequence - validation & publication", "diagrams/03_sequence_validation_publication.png", 1000, 660,
  "Controles de gouvernance (completude, role) avant publication ; export tire par le canal");

// 23. DIFFUSION
s = content("Technique", "Diffusion omnicanale : une donnee, N projections");
const ch = [
  ["E-commerce", "JSON enrichi", "Descriptions FR+EN, attributs complets, images", IND],
  ["Marketplace", "JSON aplati", "Titre court, prix, EAN, image principale", GREEN],
  ["Catalogue", "CSV", "SKU, nom, categorie, prix (PDF/papier)", AMBER],
  ["Mobile", "JSON allege", "Champs essentiels, une image (charge reseau)", BLUE],
];
ch.forEach((c, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.7 + col * 6.0, y = 2.4 + row * 2.0;
  card(s, x, y, 5.7, 1.75, { line: c[3] });
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.14, h: 1.75, fill: { color: c[3] } });
  s.addText(c[0], { x: x + 0.35, y: y + 0.2, w: 4, h: 0.5, fontSize: 18, bold: true, color: NAVY, fontFace: BF });
  s.addText(c[1], { x: x + 0.35, y: y + 0.72, w: 5, h: 0.4, fontSize: 13, bold: true, color: c[3], fontFace: "Consolas" });
  s.addText(c[2], { x: x + 0.35, y: y + 1.12, w: 5.2, h: 0.5, fontSize: 12.5, color: GREY, fontFace: BF });
});

// 24. TESTS
s = content("Technique", "Phase de test (pytest)");
const ts = [["12", "tests verts"], ["5", "domaines"], ["~610", "produits (volumetrie)"], ["60 %", "seuil de gouvernance teste"]];
ts.forEach((t, i) => {
  const x = 0.7 + i * 3.0;
  card(s, x, 2.25, 2.75, 1.4);
  s.addText(t[0], { x, y: 2.4, w: 2.75, h: 0.7, fontSize: 26, bold: true, color: IND, align: "center", fontFace: HF });
  s.addText(t[1], { x: x + 0.1, y: 3.1, w: 2.55, h: 0.5, fontSize: 12, color: GREY, align: "center", fontFace: BF });
});
const mtbl = [["Famille de tests", "Scenario", "Statut"].map(t => ({ text: t, options: { bold: true, color: WHITE, fill: NAVY } }))];
[
  ["Authentification", "login OK / mauvais mot de passe", "OK"],
  ["Ingestion / upsert", "extraction + enregistrement sans doublon EAN", "OK"],
  ["Completude", "champs manquants, montee a 100 %", "OK"],
  ["Workflow / droits", "refus < 60 %, validation admin only", "OK"],
  ["Diffusion", "publication + export canal", "OK"],
].forEach((r, i) => {
  const bg = i % 2 ? "EEF2FF" : WHITE;
  mtbl.push([
    { text: r[0], options: { bold: true, color: NAVY, fill: bg } },
    { text: r[1], options: { color: DARK, fill: bg } },
    { text: r[2], options: { bold: true, color: GREEN, align: "center", fill: bg } },
  ]);
});
s.addTable(mtbl, { x: 0.7, y: 3.95, w: 11.9, colW: [3.4, 6.5, 2.0], fontSize: 13, fontFace: BF,
  border: { type: "solid", color: LINE, pt: 1 }, rowH: 0.5, valign: "middle", margin: 6 });

// 25. GIT & CI/CD
imageSlide("Technique", "Git & integration continue (GitLab CI/CD)", "diagrams/07_cicd_gitlab.png", 1080, 640,
  "Test & build fonctionnels ; deploiement prevu/simule (jobs manuels sur une infra reelle)");

// 26. CONCLUSION
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.OVAL, { x: -2, y: 4.5, w: 6, h: 6, fill: { color: IND, transparency: 70 } });
s.addText("Conclusion & perspectives", { x: 0.9, y: 0.8, w: 11, h: 0.9, fontSize: 34, bold: true, color: WHITE, fontFace: HF });
s.addShape(p.shapes.LINE, { x: 1.0, y: 1.75, w: 2.5, h: 0, line: { color: IND2, width: 3 } });
s.addText([
  { text: "PIMP demontre les fonctions essentielles d'un PIM : ", options: { color: ICE } },
  { text: "ingestion d'etiquette par IA de vision, referentiel unique, enrichissement multilingue, pilotage par la completude, gouvernance par workflow, diffusion adaptee par canal.", options: { color: WHITE, bold: true } },
], { x: 1.0, y: 2.1, w: 11, h: 1.3, fontSize: 18, fontFace: BF, lineSpacingMultiple: 1.3 });
s.addText("Perspectives", { x: 1.0, y: 3.7, w: 5, h: 0.5, fontSize: 18, bold: true, color: IND2, fontFace: BF });
s.addText([
  { text: "Extraction par lot de plusieurs etiquettes", options: { bullet: true, breakLine: true } },
  { text: "Import/export en masse (CSV, API fournisseurs)", options: { bullet: true, breakLine: true } },
  { text: "Droits fins par attribut", options: { bullet: true, breakLine: true } },
  { text: "Syndication temps reel vers les canaux", options: { bullet: true, breakLine: true } },
  { text: "Connecteurs ERP / e-commerce", options: { bullet: true } },
], { x: 1.0, y: 4.2, w: 11, h: 2.3, fontSize: 15, color: WHITE, fontFace: BF, lineSpacingMultiple: 1.3 });

// 27. MERCI
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.OVAL, { x: 9, y: -2, w: 6.5, h: 6.5, fill: { color: IND, transparency: 65 } });
s.addText("Merci", { x: 0.9, y: 2.6, w: 8, h: 1.2, fontSize: 66, bold: true, color: WHITE, fontFace: HF });
s.addText("Questions & demonstration", { x: 1.0, y: 3.9, w: 8, h: 0.7, fontSize: 24, color: ICE, fontFace: BF });
s.addText("Projet dev4pimp25 - PIMP - Philippe Sam EFTEKHARI . Anass IMLI", { x: 1.0, y: 4.8, w: 11, h: 0.5, fontSize: 14, color: ICE, fontFace: BF });

p.writeFile({ fileName: "presentation.pptx" }).then((f) => console.log("Slides generees :", f, "."));
