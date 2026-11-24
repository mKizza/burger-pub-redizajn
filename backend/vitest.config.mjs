import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    environment: "node",
    include: ["test/**/*.test.mjs"],
    fileParallelism: false,
    testTimeout: 20_000,
    // prvo pokretanje skida MongoDB binarku (~150 MB) u beforeAll
    hookTimeout: 300_000,
    silent: "passed-only",
  },
});
