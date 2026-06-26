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
function pageNum(s) { n++; s.addText(String(n).padStart(2, "0"), { x: W - 0.9, y: H - 0.5, w: 0.6, h: 0.3, fontSize: 10, color: GREY, align: "right", fontFace: BF }); }
function tag(s, text, color) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 0.55, w: 2.6, h: 0.42, fill: { color: color || IND }, rectRadius: 0.21 });
  s.addText(text.toUpperCase(), { x: 0.7, y: 0.55, w: 2.6, h: 0.42, fontSize: 11, color: WHITE, bold: true, align: "center", valign: "middle", charSpacing: 2, fontFace: BF });
}
const SECT = { "Introduction": IND, "Demonstration": GREEN, "Technique": BLUE };
function content(tagText, title) {
  const s = p.addSlide();
  s.background = { color: LIGHT };
  const col = SECT[tagText] || IND;
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: col } });
  tag(s, tagText, col);
  s.addText(title, { x: 0.7, y: 1.05, w: W - 1.4, h: 0.8, fontSize: 27, bold: true, color: NAVY, fontFace: HF });
  s.addShape(p.shapes.LINE, { x: 0.7, y: 1.82, w: 2.2, h: 0, line: { color: col, width: 2.5 } });
  pageNum(s);
  return s;
}
function card(s, x, y, w, h, opts = {}) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: opts.fill || WHITE }, line: { color: opts.line || LINE, width: 1 }, rectRadius: 0.08, shadow: { type: "outer", color: "94A3B8", blur: 6, offset: 2, angle: 135, opacity: 0.18 } });
}
function imageSlide(tagText, title, file, wpx, hpx, caption) {
  const s = content(tagText, title);
  const ratio = hpx / wpx; let h = caption ? 4.4 : 4.7, w = h / ratio;
  if (w > 11.7) { w = 11.7; h = w * ratio; }
  s.addImage({ path: file, x: (W - w) / 2, y: 2.1, w, h });
  if (caption) s.addText(caption, { x: 0.7, y: 6.55, w: W - 1.4, h: 0.5, fontSize: 13, italic: true, color: GREY, align: "center", fontFace: BF });
  return s;
}

// ===== 1. TITRE =====
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

// ===== 2. SOMMAIRE =====
s = content("Sommaire", "Deroule de la presentation");
const agenda = [
  ["1", "Introduction", "Equipe . objectif . technologies . planning", IND, "5 min"],
  ["2", "Demonstration", "Ingestion IA . fonctionnalites . utilisateurs", GREEN, "2-3 min"],
  ["3", "Partie technique", "Architecture . extraction IA . backend . tests", BLUE, "10-15 min"],
];
agenda.forEach((a, i) => {
  const y = 2.4 + i * 1.45;
  card(s, 0.7, y, 11.9, 1.2);
  s.addShape(p.shapes.OVAL, { x: 1.0, y: y + 0.26, w: 0.68, h: 0.68, fill: { color: a[3] } });
  s.addText(a[0], { x: 1.0, y: y + 0.26, w: 0.68, h: 0.68, fontSize: 24, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: HF });
  s.addText(a[1], { x: 1.95, y: y + 0.16, w: 8, h: 0.5, fontSize: 19, bold: true, color: NAVY, fontFace: BF });
  s.addText(a[2], { x: 1.95, y: y + 0.6, w: 9, h: 0.5, fontSize: 13, color: GREY, fontFace: BF });
  s.addText(a[4], { x: 10.6, y: y + 0.35, w: 1.8, h: 0.5, fontSize: 14, bold: true, color: a[3], align: "right", fontFace: BF });
});

// ===== 3. EQUIPE & OBJECTIF =====
s = content("Introduction", "Equipe & objectif");
card(s, 0.7, 2.1, 5.6, 4.5, { fill: NAVY, line: NAVY });
s.addText("L'equipe", { x: 1.0, y: 2.35, w: 5, h: 0.5, fontSize: 18, bold: true, color: ICE, fontFace: BF });
s.addText([
  { text: "Philippe Sam EFTEKHARI", options: { breakLine: true, bold: true, fontSize: 16, color: WHITE } },
  { text: "Backend . modele de donnees . IA de vision", options: { breakLine: true, fontSize: 13, color: ICE } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Anass IMLI", options: { breakLine: true, bold: true, fontSize: 16, color: WHITE } },
  { text: "Frontend . design . diffusion", options: { fontSize: 13, color: ICE } },
], { x: 1.0, y: 3.0, w: 5, h: 3, fontFace: BF, lineSpacingMultiple: 1.2 });
card(s, 6.6, 2.1, 5.9, 4.5);
s.addText("Objectif", { x: 6.9, y: 2.35, w: 5, h: 0.5, fontSize: 18, bold: true, color: IND, fontFace: BF });
s.addText("Une plateforme PIM avec une porte d'entree intelligente : l'ingestion d'etiquette par IA de vision, puis un referentiel unique enrichi et diffuse vers tous les canaux.",
  { x: 6.9, y: 2.95, w: 5.3, h: 1.4, fontSize: 14.5, color: DARK, fontFace: BF, lineSpacingMultiple: 1.25 });
s.addText([
  { text: "Ingestion par IA de vision", options: { bullet: true, breakLine: true } },
  { text: "Referentiel unique + multilingue", options: { bullet: true, breakLine: true } },
  { text: "Gouvernance par workflow & roles", options: { bullet: true, breakLine: true } },
  { text: "Diffusion omnicanale", options: { bullet: true } },
], { x: 6.9, y: 4.45, w: 5.3, h: 2.0, fontSize: 14.5, color: NAVY, fontFace: BF, lineSpacingMultiple: 1.25 });

// ===== 4. CHOIX TECHNO =====
s = content("Introduction", "Choix technologiques justifies");
const rows = [
  ["Backend", "FastAPI", "Django / Express", "Async, Pydantic, doc OpenAPI auto"],
  ["Frontend", "React 18 + Vite", "Angular / Vue", "Composants, build instantane, SPA"],
  ["Donnees", "SQLAlchemy", "MongoDB", "Relationnel, SQLite->PostgreSQL"],
  ["Extraction", "IA vision (Gemini)", "OCR Tesseract", "Lit les vraies etiquettes, JSON direct"],
  ["Auth", "JWT", "Sessions / OAuth2", "Sans etat, adapte API + SPA"],
];
const tbl = [["Besoin", "Choix", "Alternatives", "Justification"].map(t => ({ text: t, options: { bold: true, color: WHITE, fill: NAVY } }))];
rows.forEach((r, i) => { const bg = i % 2 ? "EEF2FF" : WHITE; tbl.push([
  { text: r[0], options: { bold: true, color: NAVY, fill: bg } },
  { text: r[1], options: { bold: true, color: IND, fill: bg } },
  { text: r[2], options: { color: GREY, fill: bg } },
  { text: r[3], options: { color: DARK, fill: bg } }]); });
s.addTable(tbl, { x: 0.7, y: 2.4, w: 11.9, colW: [1.8, 2.3, 2.7, 5.1], fontSize: 13.5, fontFace: BF, border: { type: "solid", color: LINE, pt: 1 }, rowH: 0.72, valign: "middle", margin: 6 });

// ===== 5. GANTT =====
imageSlide("Introduction", "Gestion de projet & charge", "gantt.png", 960, 420,
  "Approche iterative sur 6 semaines . charge estimee ~41 jours-hommes (equipe de 2)");

// ===== 6. INGESTION PAR IA (demo - phare) =====
s = content("Demonstration", "Fonctionnalite phare : ingestion par IA de vision");
const flow = [
  ["1. Depot", "Glisser-deposer la photo d'une etiquette (JPG/PNG)", IND],
  ["2. Lecture IA", "Gemini lit l'image et renvoie un JSON structure", GREEN],
  ["3. Revue humaine", "On verifie/corrige la fiche (human-in-the-loop)", AMBER],
  ["4. Upsert EAN", "Enregistrement : mise a jour si l'EAN existe", BLUE],
];
flow.forEach((f, i) => {
  const y = 2.3 + i * 1.05;
  card(s, 0.9, y, 11.5, 0.9, { line: f[2] });
  s.addShape(p.shapes.RECTANGLE, { x: 0.9, y, w: 0.14, h: 0.9, fill: { color: f[2] } });
  s.addText(f[0], { x: 1.25, y: y + 0.1, w: 3.1, h: 0.7, fontSize: 16, bold: true, color: NAVY, valign: "middle", fontFace: BF });
  s.addText(f[1], { x: 4.4, y: y + 0.1, w: 7.8, h: 0.7, fontSize: 13.5, color: GREY, valign: "middle", fontFace: BF });
});
s.addText("Pourquoi l'IA de vision et pas un OCR : les vraies etiquettes (bouteilles courbees, logos, photos) ne sont pas lisibles ligne a ligne.",
  { x: 0.9, y: 6.6, w: 11.5, h: 0.5, fontSize: 13, italic: true, color: GREY, align: "center", fontFace: BF });

// ===== 7. CAS D'UTILISATION (acteurs / interactions) =====
imageSlide("Demonstration", "Acteurs & cas d'utilisation", "diagrams/01_cas_utilisation.png", 1000, 660,
  "4 roles (admin, marketing, achats, fournisseur) + canal externe . validation/publication reservees a l'admin");

// ===== 8. PARCOURS + CAPTURES =====
s = content("Demonstration", "Parcours & fonctionnalites");
const steps = [
  ["Ingestion", "Etiquette -> extraction IA -> fiche"],
  ["Catalogue", "Recherche, filtres, pagination (~610)"],
  ["Fiche produit", "Attributs FR/EN, medias, completude"],
  ["Workflow", "Soumettre -> valider -> publier"],
  ["Diffusion", "Flux adaptes par canal"],
];
steps.forEach((st, i) => {
  const y = 2.3 + i * 0.82;
  card(s, 0.8, y, 6.2, 0.7);
  s.addShape(p.shapes.OVAL, { x: 1.0, y: y + 0.11, w: 0.48, h: 0.48, fill: { color: IND } });
  s.addText(String(i + 1), { x: 1.0, y: y + 0.11, w: 0.48, h: 0.48, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: HF });
  s.addText(st[0], { x: 1.65, y: y + 0.08, w: 2.2, h: 0.55, fontSize: 14, bold: true, color: NAVY, valign: "middle", fontFace: BF });
  s.addText(st[1], { x: 3.7, y: y + 0.08, w: 3.2, h: 0.55, fontSize: 11.5, color: GREY, valign: "middle", fontFace: BF });
});
card(s, 7.3, 2.3, 5.2, 4.3, { fill: "FEF3C7", line: AMBER });
s.addText("Captures de la plateforme", { x: 7.55, y: 2.55, w: 4.7, h: 0.4, fontSize: 14, bold: true, color: "92400E", fontFace: BF });
s.addText("A coller ici : tableau de bord, ingestion (fiche pre-remplie), catalogue. Glissez vos captures d'ecran depuis l'appli.",
  { x: 7.55, y: 3.0, w: 4.7, h: 3.3, fontSize: 13, color: "92400E", fontFace: BF, lineSpacingMultiple: 1.25 });

// ===== 9. ARCHITECTURE =====
imageSlide("Technique", "Architecture trois tiers", "architecture.png", 980, 620,
  "Presentation (React) . Metier (FastAPI + IA de vision) . Donnees (SQLAlchemy) - couplage faible par API REST/JWT");

// ===== 10. EXTRACTION IA =====
s = content("Technique", "Extraction par IA de vision (Gemini)");
card(s, 0.7, 2.3, 5.7, 4.2);
s.addText("Principe", { x: 1.0, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText([
  { text: "Image encodee en base64 cote serveur", options: { bullet: true, breakLine: true } },
  { text: "Prompt strict -> reponse imposee en JSON", options: { bullet: true, breakLine: true } },
  { text: "Cle API dans .env, jamais exposee au front", options: { bullet: true, breakLine: true } },
  { text: "IA remplacable sans toucher au reste", options: { bullet: true } },
], { x: 1.0, y: 3.1, w: 5.2, h: 3.2, fontSize: 14.5, color: DARK, fontFace: BF, lineSpacingMultiple: 1.4 });
card(s, 6.6, 2.3, 5.9, 4.2);
s.addText("Sortie structuree (exemple reel)", { x: 6.9, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText('{\n  "nom_produit": "Mont Roucous",\n  "marque": "Mont Roucous",\n  "ean": "3257971080112",\n  "categorie": "Eau",\n  "contenance": "1,5 L",\n  "pays_origine": "France",\n  "composition": [\n    {"libelle":"Calcium","valeur":"1,20 mg/l"}\n  ]\n}',
  { x: 6.9, y: 3.05, w: 5.4, h: 3.2, fontSize: 12, color: DARK, fontFace: "Consolas", lineSpacingMultiple: 1.1 });

// ===== 11. MCD MERISE =====
imageSlide("Technique", "Modele de donnees (MCD Merise)", "diagrams/05_mcd_merise.png", 1120, 800,
  "Produit au centre . attributs dynamiques par famille . valeur + langue (multilingue natif) . EAN = cle anti-doublon");

// ===== 12. BACKEND & API =====
s = content("Technique", "Backend & API REST");
card(s, 0.7, 2.3, 5.7, 4.2);
s.addText("Organisation du code", { x: 1.0, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText([
  { text: "models.py / schemas.py (ORM + Pydantic)", options: { bullet: true, breakLine: true } },
  { text: "auth.py - JWT & roles (RBAC)", options: { bullet: true, breakLine: true } },
  { text: "services/extraction.py - IA de vision", options: { bullet: true, breakLine: true } },
  { text: "completeness.py - qualite", options: { bullet: true, breakLine: true } },
  { text: "routers/ - un par domaine (dont ingest)", options: { bullet: true } },
], { x: 1.0, y: 3.1, w: 5.2, h: 3.2, fontSize: 13.5, color: DARK, fontFace: "Consolas", lineSpacingMultiple: 1.35 });
card(s, 6.6, 2.3, 5.9, 4.2);
s.addText("Endpoints principaux", { x: 6.9, y: 2.5, w: 5, h: 0.5, fontSize: 17, bold: true, color: IND, fontFace: BF });
s.addText([
  { text: "POST /ingest/extract  (IA de vision)", options: { breakLine: true, color: GREEN, bold: true } },
  { text: "POST /ingest/save  (upsert EAN)", options: { breakLine: true, color: AMBER, bold: true } },
  { text: "GET  /products  (filtres + pagination)", options: { breakLine: true, color: NAVY } },
  { text: "GET  /products/{id}/completeness", options: { breakLine: true, color: NAVY } },
  { text: "POST /products/{id}/transition", options: { breakLine: true, color: AMBER, bold: true } },
  { text: "POST /channels/{id}/publish", options: { breakLine: true, color: NAVY } },
  { text: "GET  /dashboard", options: { color: NAVY } },
], { x: 6.9, y: 3.05, w: 5.4, h: 3.3, fontSize: 13, fontFace: "Consolas", lineSpacingMultiple: 1.35 });

// ===== 13. WORKFLOW & GOUVERNANCE =====
s = content("Technique", "Workflow, qualite & gouvernance");
const wf = [["Brouillon", "475569"], ["En revue", AMBER], ["Valide", GREEN], ["Publie", BLUE]];
wf.forEach((w2, i) => {
  const x = 0.9 + i * 3.05;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.5, w: 2.4, h: 0.9, fill: { color: w2[1] }, rectRadius: 0.1 });
  s.addText(w2[0], { x, y: 2.5, w: 2.4, h: 0.9, fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: BF });
  if (i < 3) s.addText(">", { x: x + 2.4, y: 2.5, w: 0.65, h: 0.9, fontSize: 24, color: GREY, align: "center", valign: "middle" });
});
const ru = [
  "Completude = % attributs requis + image ; liste des champs manquants",
  "Soumission refusee si completude < 60 %",
  "Seul l'admin valide/publie . chaque transition est historisee",
];
ru.forEach((r, i) => {
  const y = 3.9 + i * 0.9;
  card(s, 1.0, y, 11.3, 0.75);
  s.addShape(p.shapes.OVAL, { x: 1.25, y: y + 0.18, w: 0.4, h: 0.4, fill: { color: IND } });
  s.addText("v", { x: 1.25, y: y + 0.18, w: 0.4, h: 0.4, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle" });
  s.addText(r, { x: 1.85, y, w: 10.2, h: 0.75, fontSize: 14.5, color: DARK, valign: "middle", fontFace: BF });
});

// ===== 14. TESTS =====
s = content("Technique", "Phase de test (pytest)");
const ts = [["12", "tests verts"], ["5", "domaines"], ["~610", "produits"], ["60 %", "seuil gouvernance"]];
ts.forEach((t, i) => {
  const x = 0.7 + i * 3.0;
  card(s, x, 2.4, 2.75, 1.4);
  s.addText(t[0], { x, y: 2.55, w: 2.75, h: 0.7, fontSize: 26, bold: true, color: IND, align: "center", fontFace: HF });
  s.addText(t[1], { x: x + 0.1, y: 3.25, w: 2.55, h: 0.5, fontSize: 12, color: GREY, align: "center", fontFace: BF });
});
const mtbl = [["Famille de tests", "Scenario", "Statut"].map(t => ({ text: t, options: { bold: true, color: WHITE, fill: NAVY } }))];
[
  ["Authentification", "login OK / mauvais mot de passe", "OK"],
  ["Ingestion / upsert", "extraction + enregistrement sans doublon", "OK"],
  ["Completude", "champs manquants, montee a 100 %", "OK"],
  ["Workflow / droits", "refus < 60 %, validation admin only", "OK"],
  ["Diffusion", "publication + export canal", "OK"],
].forEach((r, i) => { const bg = i % 2 ? "EEF2FF" : WHITE; mtbl.push([
  { text: r[0], options: { bold: true, color: NAVY, fill: bg } },
  { text: r[1], options: { color: DARK, fill: bg } },
  { text: r[2], options: { bold: true, color: GREEN, align: "center", fill: bg } }]); });
s.addTable(mtbl, { x: 0.7, y: 4.1, w: 11.9, colW: [3.4, 6.5, 2.0], fontSize: 13, fontFace: BF, border: { type: "solid", color: LINE, pt: 1 }, rowH: 0.5, valign: "middle", margin: 6 });

// ===== 15. CONCLUSION & MERCI =====
s = p.addSlide();
s.background = { color: NAVY };
s.addShape(p.shapes.OVAL, { x: -2, y: 4.2, w: 6, h: 6, fill: { color: IND, transparency: 70 } });
s.addShape(p.shapes.OVAL, { x: 10, y: -2, w: 6, h: 6, fill: { color: IND2, transparency: 78 } });
s.addText("Conclusion & perspectives", { x: 0.9, y: 0.7, w: 11.5, h: 0.9, fontSize: 32, bold: true, color: WHITE, fontFace: HF });
s.addShape(p.shapes.LINE, { x: 1.0, y: 1.6, w: 2.5, h: 0, line: { color: IND2, width: 3 } });
s.addText([
  { text: "PIMP demontre les fonctions essentielles d'un PIM : ", options: { color: ICE } },
  { text: "ingestion par IA de vision, referentiel unique, enrichissement multilingue, qualite, gouvernance par workflow, diffusion omnicanale.", options: { color: WHITE, bold: true } },
], { x: 1.0, y: 1.95, w: 11.3, h: 1.2, fontSize: 16.5, fontFace: BF, lineSpacingMultiple: 1.25 });
s.addText("Perspectives", { x: 1.0, y: 3.25, w: 5, h: 0.4, fontSize: 16, bold: true, color: IND2, fontFace: BF });
s.addText([
  { text: "Extraction par lot . import/export en masse", options: { bullet: true, breakLine: true } },
  { text: "Connecteurs ERP / e-commerce . syndication temps reel", options: { bullet: true } },
], { x: 1.0, y: 3.65, w: 11, h: 1.0, fontSize: 14.5, color: WHITE, fontFace: BF, lineSpacingMultiple: 1.25 });
s.addShape(p.shapes.LINE, { x: 1.0, y: 5.05, w: 11.3, h: 0, line: { color: "3A4170", width: 1 } });
s.addText("Merci - Questions & demonstration", { x: 0.9, y: 5.35, w: 11.5, h: 0.8, fontSize: 30, bold: true, color: WHITE, fontFace: HF });
s.addText("Projet dev4pimp25 - PIMP - Philippe Sam EFTEKHARI . Anass IMLI", { x: 1.0, y: 6.35, w: 11.5, h: 0.4, fontSize: 13, color: ICE, fontFace: BF });

p.writeFile({ fileName: "presentation.pptx" }).then((f) => console.log("OK:", f));
