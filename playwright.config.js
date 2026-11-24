import { defineConfig, devices } from "@playwright/test";

const SITE = "http://127.0.0.1:5660";
const API = "http://127.0.0.1:5661";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: SITE,
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: [
    {
      command: "node backend/test/e2e-server.js",
      url: `${API}/__e2e/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
      stdout: "pipe",
    },
    {
      command: "npx vite build --config e2e/vite.config.js && npx vite preview --config e2e/vite.config.js",
      url: SITE,
      env: { VITE_API_URL: "" },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
