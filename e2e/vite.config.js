import { defineConfig, mergeConfig } from "vite";
import base from "../vite.config.js";

const API = "http://127.0.0.1:5661";

// Prazno: build zove /api na istom originu, a preview ga prosljeđuje testnom API-ju.
process.env.VITE_API_URL = "";

function dropOrigin(proxy) {
  proxy.on("proxyReq", (proxyReq) => proxyReq.removeHeader("origin"));
}

export default mergeConfig(
  base,
  defineConfig({
    build: {
      outDir: "dist-e2e",
      emptyOutDir: true,
    },
    preview: {
      host: "127.0.0.1",
      port: 5660,
      strictPort: true,
      proxy: {
        "/api": { target: API, configure: dropOrigin },
        "/uploads": { target: API },
      },
    },
  }),
);
