import React, { useState } from "react";
import { api } from "../api.js";
import { IconGlobe } from "../icons.jsx";

const CHANNELS = [
  { code: "ecommerce", label: "Site e-commerce", fmt: "JSON enrichi (FR + EN, attributs, images)" },
  { code: "marketplace", label: "Marketplace", fmt: "JSON aplati (titre court, prix, EAN)" },
  { code: "catalogue", label: "Catalogue PDF / papier", fmt: "Export CSV" },
  { code: "mobile", label: "Application mobile", fmt: "JSON allégé (1 image)" },
];

export default function Channels() {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async (ch) => {
    setBusy(ch);
    try {
      const res = await api.exportChannel(ch);
      if (ch === "catalogue") {
        setPreview({ ch, text: await res.text() });
      } else {
        const data = await res.json();
        setPreview({ ch, text: JSON.stringify(data.slice(0, 5), null, 2), count: data.length });
      }
    } catch (e) {
      setPreview({ ch, text: "Erreur : " + e.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="stat-grid">
        {CHANNELS.map((c) => (
          <div className="stat" key={c.code}>
            <div className="ico"><IconGlobe /></div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16 }}>{c.label}</div>
            <div className="lbl">{c.fmt}</div>
            <button className="btn ghost" style={{ marginTop: 14 }} onClick={() => load(c.code)} disabled={busy === c.code}>
              {busy === c.code ? <span className="spinner brand" /> : null} Aperçu du flux
            </button>
          </div>
        ))}
      </div>

      {preview && (
        <div className="card" style={{ marginTop: 8 }}>
          <div className="card-head">
            <span className="card-title">Flux « {preview.ch} »</span>
            {preview.count != null && <span className="muted" style={{ fontSize: 13 }}>{preview.count} produits</span>}
          </div>
          <div style={{ padding: 20 }}>
            <pre className="flux">{preview.text || "(aucun produit publié sur ce canal)"}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
