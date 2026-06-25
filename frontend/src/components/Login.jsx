import React, { useState } from "react";
import { api, setAuth } from "../api.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      const auth = await api.login(username, password);
      setAuth(auth);
      onLogin(auth);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="logo">
          <div className="mark">P</div>
          <div>
            <div className="name" style={{ color: "var(--ink)" }}>PIMP</div>
            <div className="tag" style={{ color: "var(--muted)" }}>Product Information Mgmt</div>
          </div>
        </div>
        <h1>Connexion</h1>
        <div className="sub">Plateforme de Product Information Management</div>

        <div className="field">
          <label>Utilisateur</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <button className="btn primary" onClick={submit} disabled={busy}>
          {busy ? <span className="spinner" /> : null} Se connecter
        </button>
        {err && <div className="err">{err}</div>}
        <div className="login-hint">
          Comptes de démo : admin · marketing · achats · fournisseur
          <br />
          (mot de passe = identifiant suivi de « 123 »)
        </div>
      </div>
    </div>
  );
}
