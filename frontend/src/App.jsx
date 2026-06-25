import React, { useState, useEffect, useCallback } from "react";
import { getAuth, clearAuth, api } from "./api.js";
import Login from "./components/Login.jsx";
import Ingest from "./components/Ingest.jsx";
import Catalog from "./components/Catalog.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Channels from "./components/Channels.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import { IconScan, IconCatalog, IconChart, IconGlobe } from "./icons.jsx";

const NAV = [
  { id: "ingest", label: "Ingestion", icon: IconScan, title: "Ingestion d'étiquette", sub: "Déposez une étiquette : l'IA lit l'image et pré-remplit la fiche produit." },
  { id: "catalog", label: "Catalogue", icon: IconCatalog, title: "Catalogue produits", sub: "Le référentiel unique : recherche, filtres et enrichissement." },
  { id: "dashboard", label: "Tableau de bord", icon: IconChart, title: "Tableau de bord", sub: "Pilotage de la qualité et de la complétude des données." },
  { id: "channels", label: "Diffusion", icon: IconGlobe, title: "Diffusion omnicanale", sub: "Chaque canal reçoit une projection adaptée de la donnée." },
];

export default function App() {
  const [auth, setAuthState] = useState(getAuth());
  const [view, setView] = useState("ingest");
  const [refreshKey, setRefreshKey] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [apiOk, setApiOk] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (auth) api.health().then(() => setApiOk(true)).catch(() => setApiOk(false));
  }, [auth]);

  const notify = useCallback((msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3200);
  }, []);

  if (!auth) return <Login onLogin={setAuthState} />;

  const refresh = () => setRefreshKey((k) => k + 1);
  const current = NAV.find((n) => n.id === view);
  const initials = (auth.full_name || auth.role || "?")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="mark">P</div>
          <div>
            <div className="name">PIMP</div>
            <div className="tag">Product Information Mgmt</div>
          </div>
        </div>
        <nav className="nav">
          <div className="eyebrow">Espace de travail</div>
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id} className={`nav-item ${view === n.id ? "active" : ""}`} onClick={() => setView(n.id)}>
                <Icon /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="side-foot">
          <div className="role-box">
            <div className="av">{initials}</div>
            <div>
              <div className="who">{auth.full_name || "Utilisateur"}</div>
              <div className="role">{auth.role}</div>
            </div>
          </div>
          <button className="logout" onClick={() => { clearAuth(); setAuthState(null); }}>
            Déconnexion
          </button>
          <div className="db-chip" style={{ marginTop: 8 }}>
            <span className={`dot ${apiOk ? "" : "amber"}`} />
            {apiOk ? "API connectée" : "API injoignable"}
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{current.title}</h1>
            <div className="sub">{current.sub}</div>
          </div>
        </header>

        <div className="content">
          {view === "ingest" && <Ingest onSaved={refresh} notify={notify} />}
          {view === "catalog" && <Catalog refreshKey={refreshKey} onOpen={setOpenId} goIngest={() => setView("ingest")} />}
          {view === "dashboard" && <Dashboard refreshKey={refreshKey} />}
          {view === "channels" && <Channels />}
        </div>
      </main>

      {openId && (
        <ProductDetail
          id={openId}
          role={auth.role}
          onClose={() => setOpenId(null)}
          onChanged={refresh}
          notify={notify}
        />
      )}
      {toast && (
        <div className={`toast ${toast.error ? "err" : ""}`}>
          <span className="tdot" /> {toast.msg}
        </div>
      )}
    </div>
  );
}
