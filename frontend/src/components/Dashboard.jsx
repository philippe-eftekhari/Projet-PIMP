import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { IconBox, IconCheck, IconLayers, IconCatalog } from "../icons.jsx";

const STATUS_LABEL = {
  draft: "Brouillon", in_review: "En revue", approved: "Validé", published: "Publié",
};

export default function Dashboard({ refreshKey }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.dashboard().then(setData).catch(() => {}); }, [refreshKey]);
  if (!data) return <p className="muted">Chargement…</p>;

  const maxBucket = Math.max(...Object.values(data.completeness_buckets), 1);
  const stats = [
    [data.total_products, "Produits au référentiel", IconBox],
    [`${data.avg_completeness}%`, "Complétude moyenne", IconCheck],
    [data.families, "Familles produits", IconLayers],
    [data.categories, "Catégories", IconCatalog],
  ];

  return (
    <div>
      <div className="stat-grid">
        {stats.map(([num, lbl, Icon], i) => (
          <div className="stat" key={i}>
            <div className="ico"><Icon /></div>
            <div className="num">{num}</div>
            <div className="lbl">{lbl}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="card">
          <div className="card-head"><span className="card-title">Répartition par statut</span></div>
          <div style={{ padding: 20 }}>
            {Object.entries(data.by_status).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <span className={"badge " + k}>{STATUS_LABEL[k] || k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">Distribution de la complétude</span></div>
          <div style={{ padding: 20 }}>
            {Object.entries(data.completeness_buckets).map(([range, v]) => (
              <div className="bar-row" key={range}>
                <div className="top"><span className="muted">{range}%</span><span>{v}</span></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${100 * v / maxBucket}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="card-head"><span className="card-title">Produits publiés par canal</span></div>
        <div style={{ padding: 20 }}>
          {Object.keys(data.channel_counts).length === 0 ? (
            <p className="muted">Aucune publication pour l'instant.</p>
          ) : (
            <div className="chips">
              {Object.entries(data.channel_counts).map(([ch, v]) => (
                <span key={ch} className="chip">{ch} · {v}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
