import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";

export const API = "http://127.0.0.1:5661";
export const ADMIN = { username: "e2e-admin", password: "e2e-password-123" };
export const PUB_EMAIL = "burgerpubmunchen@gmail.com";

export const test = base.extend({
  backend: [
    async ({ request }, use) => {
      const reset = await request.post(`${API}/__e2e/reset`);
      expect(reset.ok()).toBe(true);

      await use({
        async mails() {
          return (await (await request.get(`${API}/__e2e/mails`)).json()).mails;
        },
        async failMail(fail) {
          await request.post(`${API}/__e2e/mail-fail`, { data: { fail } });
        },
        async images() {
          return (await (await request.get(`${API}/__e2e/images`)).json()).images;
        },
        async token() {
          const res = await request.post(`${API}/api/auth/login`, { data: ADMIN });
          return (await res.json()).token;
        },
        async reset() {
          await request.post(`${API}/__e2e/reset`);
        },
      });
    },
    { auto: true },
  ],
});

export { expect };

export async function loginWithToken(page, backend) {
  const token = await backend.token();

  await page.goto("/admin-login");
  await page.evaluate((value) => localStorage.setItem("token", value), token);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "MENU", level: 1 })).toBeVisible();
}

// Prije skeniranja: animacije (fade-up) bi inače smanjile kontrast usred prijelaza.
export async function expectNoA11yViolations(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {}))));

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const serious = violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact))
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`);

  expect(serious).toEqual([]);
}

export function munichDate(offsetDays = 0) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);

  return date.toISOString().slice(0, 10);
}

export function germanShortDate(isoDate) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
