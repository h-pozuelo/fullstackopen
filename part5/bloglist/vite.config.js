import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true, // Parámetro que nos permitirá llamar a métodos como "describe" o "test" sin necesidad de importarlos.
    setupFiles: "./testSetup.js",
    coverage: {
      provider: "v8",
    },
  },
});
