import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: { host: true, port: 5173 },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /* Separa os fornecedores grandes: o mapa (Leaflet) só é usado em
           duas telas e o framework muda menos que o produto — cache melhor
           e o chunk principal fica abaixo do alerta de 500 kB. */
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet", "leaflet.markercluster"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
