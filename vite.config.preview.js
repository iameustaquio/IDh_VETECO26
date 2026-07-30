import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build de un único archivo HTML autocontenido, solo para revisión rápida
// en el navegador (compartir por email/chat) — no es el build de producción,
// que usa vite.config.js normal (assets separados, mejor cacheable).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-preview",
    emptyOutDir: true,
  },
});
