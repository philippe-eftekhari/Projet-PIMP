// Couche d'acces a l'API : gere le token JWT et centralise les appels REST.
const TOKEN_KEY = "pimp_token";

export function getAuth() {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function setAuth(auth) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(auth));
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const auth = getAuth();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (auth?.access_token) headers["Authorization"] = `Bearer ${auth.access_token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (res.status === 401) {
    clearAuth();
    window.location.reload();
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.detail || `Erreur ${res.status}`);
  return data;
}

export const api = {
  // --- Auth ---
  login: async (username, password) => {
    const body = new URLSearchParams({ username, password });
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error("Identifiants incorrects");
    return res.json();
  },

  health: () => request("/health"),
  dashboard: () => request("/dashboard"),
  families: () => request("/families"),
  categories: () => request("/categories"),

  products: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/products?${qs}`);
  },
  product: (id) => request(`/products/${id}`),
  completeness: (id) => request(`/products/${id}/completeness`),
  updateProduct: (id, payload) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  addAsset: (id, payload) =>
    request(`/products/${id}/assets`, { method: "POST", body: JSON.stringify(payload) }),
  transition: (id, to_status, comment = "") =>
    request(`/products/${id}/transition`, {
      method: "POST",
      body: JSON.stringify({ to_status, comment }),
    }),
  logs: (id) => request(`/products/${id}/logs`),
  publish: (id, channel) =>
    request(`/channels/${id}/publish?channel=${channel}`, { method: "POST" }),
  exportChannel: (channel) => {
    const auth = getAuth();
    const headers = {};
    if (auth?.access_token) headers["Authorization"] = `Bearer ${auth.access_token}`;
    return fetch(`/api/channels/${channel}/export`, { headers });
  },

  // --- Ingestion par IA de vision ---
  extract: (file) => {
    const auth = getAuth();
    const fd = new FormData();
    fd.append("etiquette", file);
    const headers = {};
    if (auth?.access_token) headers["Authorization"] = `Bearer ${auth.access_token}`;
    return fetch("/api/ingest/extract", { method: "POST", body: fd, headers }).then(
      async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
        return data;
      }
    );
  },
  saveIngest: (produit) =>
    request("/ingest/save", { method: "POST", body: JSON.stringify(produit) }),
};
