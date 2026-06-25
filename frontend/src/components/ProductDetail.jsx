import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { IconClose, IconCheck } from "../icons.jsx";

const LOCALES = ["fr", "en"];
const STATUS_LABEL = {
  draft: "Brouillon", in_review: "En revue", approved: "Validé", published: "Publié",
};
const NEXT = {
  draft: [["in_review", "Soumettre à validation"]],
  in_review: [["approved", "Valider"], ["draft", "Renvoyer en brouillon"]],
  approved: [["published", "Publier"], ["draft", "Renvoyer en brouillon"]],
  published: [["draft", "Dépublier"]],
};
const CHANNELS = ["ecommerce", "marketplace", "catalogue", "mobile"];
const compColor = (c) => (c >= 75 ? "var(--brand)" : c >= 50 ? "var(--amber)" : "var(--danger)");

export default function ProductDetail({ id, role, onClose, onChanged, notify }) {
  const [product, setProduct] = useState(null);
  const [family, setFamily] = useState(null);
  const [comp, setComp] = useState(null);
  const [logs, setLogs] = useState([]);
  const [locale, setLocale] = useState("fr");
  const [values, setValues] = useState({});
  const [name, setName] = useState("");
  const [newImg, setNewImg] = useState("");

  const load = async () => {
    const p = await api.product(id);
    setProduct(p); setName(p.name);
    const fam = await api.families().then((fs) => fs.find((f) => f.id === p.family_id));
    setFamily(fam);
    const map = {};
    p.values.forEach((v) => { map[`${v.attribute_id}:${v.locale}`] = v.value; });
    setValues(map);
    setComp(await api.completeness(id));
    setLogs(await api.logs(id));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const setVal = (attrId, loc, val) => setValues((s) => ({ ...s, [`${attrId}:${loc}`]: val }));

  const save = async () => {
    const payload = { name, values: [] };
    (family?.attributes || []).forEach((a) => {
      const locs = a.localizable ? LOCALES : ["fr"];
      locs.forEach((loc) => {
        const key = `${a.id}:${loc}`;
        if (values[key] !== undefined)
          payload.values.push({ attribute_id: a.id, locale: loc, value: values[key] || "" });
      });
    });
    try { await api.updateProduct(id, payload); notify("Modifications enregistrées."); await load(); onChanged?.(); }
    catch (e) { notify(e.message, true); }
  };

  const doTransition = async (to) => {
    try { await api.transition(id, to); notify(`Statut → ${STATUS_LABEL[to]}`); await load(); onChanged?.(); }
    catch (e) { notify(e.message, true); }
  };
  const doPublish = async (ch) => {
    try { await api.publish(id, ch); notify(`Publié sur ${ch}`); await load(); onChanged?.(); }
    catch (e) { notify(e.message, true); }
  };
  const addImage = async () => {
    if (!newImg) return;
    try { await api.addAsset(id, { type: "image", url: newImg, alt: name }); setNewImg(""); await load(); onChanged?.(); }
    catch (e) { notify(e.message, true); }
  };

  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <div>
            <h2>{product ? product.name : "Chargement…"}</h2>
            {product && (
              <div className="muted" style={{ fontSize: 13 }}>
                <span className="mono">{product.sku}</span>
                {family && <> · {family.name}</>} ·{" "}
                <span className={"badge " + product.status}>{STATUS_LABEL[product.status]}</span>
              </div>
            )}
          </div>
          <button className="icon-btn" onClick={onClose}><IconClose width={17} height={17} /></button>
        </div>

        <div className="drawer-body">
          {!product || !family ? (
            <p className="muted">Chargement…</p>
          ) : (
            <>
              {/* Qualité */}
              {comp && (
                <div className="card" style={{ padding: 16, marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="bar" style={{ flex: 1 }}>
                      <span style={{ width: `${comp.score}%`, background: compColor(comp.score) }} />
                    </div>
                    <strong>{comp.score}%</strong>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, margin: "8px 0" }}>
                    {comp.filled}/{comp.total} champs requis renseignés
                  </div>
                  {comp.missing.length > 0 && (
                    <div>{comp.missing.map((m) => <span key={m} className="miss">{m}</span>)}</div>
                  )}
                </div>
              )}

              {/* Enrichissement */}
              <div className="field">
                <label>Nom du produit</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="locale-tabs">
                {LOCALES.map((l) => (
                  <button key={l} className={"locale-tab " + (locale === l ? "active" : "")} onClick={() => setLocale(l)}>{l.toUpperCase()}</button>
                ))}
              </div>

              {family.attributes.map((a) => {
                const loc = a.localizable ? locale : "fr";
                const key = `${a.id}:${loc}`;
                const val = values[key] ?? "";
                return (
                  <div className="field" key={a.id}>
                    <label>
                      {a.label}{a.required && <span className="req"> *</span>}
                      {a.unit ? <span className="muted"> ({a.unit})</span> : null}
                      {a.localizable && <span className="pill ai">{loc}</span>}
                    </label>
                    {a.type === "textarea" ? (
                      <textarea value={val} onChange={(e) => setVal(a.id, loc, e.target.value)} />
                    ) : a.type === "select" ? (
                      <select value={val} onChange={(e) => setVal(a.id, loc, e.target.value)}>
                        <option value="">—</option>
                        {a.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={val} onChange={(e) => setVal(a.id, loc, e.target.value)}
                             type={a.type === "number" || a.type === "price" ? "number" : "text"} />
                    )}
                  </div>
                );
              })}

              {/* Médias */}
              <div className="sec-title">Médias</div>
              {product.assets.length > 0 && (
                <div className="thumb-row" style={{ marginBottom: 10 }}>
                  {product.assets.map((as) => <img key={as.id} className="thumb" src={as.url} alt={as.alt} />)}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="URL d'une image" value={newImg} onChange={(e) => setNewImg(e.target.value)} />
                <button className="btn ghost" onClick={addImage}>Ajouter</button>
              </div>

              <button className="btn primary block" style={{ marginTop: 18 }} onClick={save}>
                <IconCheck width={17} height={17} /> Enregistrer
              </button>

              {/* Workflow */}
              <div className="sec-title">Workflow</div>
              <div className="wf-actions">
                {(NEXT[product.status] || []).map(([to, label]) => (
                  <button key={to} className="btn" onClick={() => doTransition(to)}>{label}</button>
                ))}
                {role !== "admin" && product.status === "in_review" && (
                  <p className="muted" style={{ fontSize: 12 }}>Seul un administrateur (data steward) peut valider.</p>
                )}
              </div>

              {/* Diffusion */}
              {["approved", "published"].includes(product.status) && (
                <>
                  <div className="sec-title">Diffusion</div>
                  {CHANNELS.map((ch) => {
                    const on = (product.channels || []).includes(ch);
                    return (
                      <div key={ch} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                        <span className="chip">{ch}</span>
                        {on ? <span className="pill ok">publié ✓</span>
                            : <button className="btn ghost" style={{ padding: "6px 12px" }} onClick={() => doPublish(ch)}>Publier</button>}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Historique */}
              <div className="sec-title">Historique</div>
              {logs.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>Aucun mouvement.</p>
              ) : (
                logs.map((l) => (
                  <div key={l.id} className="log-line">
                    <span className="muted">{l.from_status} → </span><strong>{l.to_status}</strong>
                    <span className="muted"> · par {l.user}</span>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
