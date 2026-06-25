import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { IconSearch, IconBox } from "../icons.jsx";

const STATUS_LABEL = {
  draft: "Brouillon", in_review: "En revue", approved: "Validé", published: "Publié",
};
const compColor = (c) => (c >= 75 ? "var(--brand)" : c >= 50 ? "var(--amber)" : "var(--danger)");

export default function Catalog({ refreshKey, onOpen, goIngest }) {
  const [data, setData] = useState({ items: [], total: 0 });
  const [families, setFamilies] = useState([]);
  const [q, setQ] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  useEffect(() => { api.families().then(setFamilies).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    api.products({ q, family_id: familyId, status, page, page_size: pageSize })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [q, familyId, status, page, refreshKey]);

  const pages = Math.ceil(data.total / pageSize) || 1;

  return (
    <div>
      <div className="toolbar">
        <div className="search">
          <IconSearch />
          <input placeholder="Rechercher un produit (nom ou SKU)…"
                 value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <select value={familyId} onChange={(e) => { setFamilyId(e.target.value); setPage(1); }}>
          <option value="">Toutes familles</option>
          {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="count">{data.total} produits</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Produit</th><th>SKU</th><th>Statut</th><th style={{ width: 200 }}>Complétude</th></tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={4}><div className="skeleton" style={{ width: "100%" }} /></td></tr>
                ))
              ) : data.items.length === 0 ? (
                <tr><td colSpan={4}>
                  <div className="empty">
                    <div className="ico"><IconBox /></div>
                    <h3>Aucun produit</h3>
                    <p>Aucun produit ne correspond à votre recherche.</p>
                    {goIngest && <button className="btn primary" onClick={goIngest}>Ingérer une étiquette</button>}
                  </div>
                </td></tr>
              ) : (
                data.items.map((p) => (
                  <tr key={p.id} onClick={() => onOpen(p.id)}>
                    <td>
                      <div className="cell-flex">
                        <div className="avatar">{(p.name || "?")[0].toUpperCase()}</div>
                        <span className="prod-name">{p.name}</span>
                      </div>
                    </td>
                    <td className="mono muted">{p.sku}</td>
                    <td><span className={"badge " + p.status}>{STATUS_LABEL[p.status]}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="bar"><span style={{ width: `${p.completeness}%`, background: compColor(p.completeness) }} /></div>
                        <span style={{ fontSize: 13, minWidth: 38 }}>{p.completeness}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Précédent</button>
          <span className="muted">Page {page} / {pages}</span>
          <button className="btn ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Suivant →</button>
        </div>
      )}
    </div>
  );
}
