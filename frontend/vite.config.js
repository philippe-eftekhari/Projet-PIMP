import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le proxy renvoie les appels /api et /uploads vers l'API FastAPI (port 8000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/uploads": "http://localhost:8000",
    },
  },
});
