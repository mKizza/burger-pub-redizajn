import { expect, expectNoA11yViolations, test } from "./support";

const CATEGORIES = [
  "BEEF BURGER",
  "CHICKEN & VEGGIE BURGERS",
  "HAUPTGERICHTE & FINGER FOOD",
  "BURGER PUR MIT PLATTE",
  "SALATE",
  "BEILAGEN",
  "DIPS",
];

test.describe("menu page", () => {
  test("shows the seeded menu: 7 categories in order, 44 dishes, 5 with photos", async ({ page }) => {
    await page.goto("/menu");

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 2 })).toHaveText([...CATEGORIES, "TISCH RESERVIEREN."]);
    await expect(page.locator("[id^='gericht-']")).toHaveCount(44);
    await expect(main.getByRole("article")).toHaveCount(5);

    const classic = main.getByRole("article").filter({ hasText: "CLASSIC BEEF BURGER" });
    await expect(classic.getByRole("img", { name: "CLASSIC BEEF BURGER" })).toBeVisible();
    await expect(classic).toContainText("14,50 €");
    await expect(main.getByRole("listitem").filter({ hasText: "CHILI CHEESE SAUCE" })).toContainText("2,00 €");
  });

  test("jumps to a category from its chip and marks it", async ({ page }) => {
    await page.goto("/menu");
    const chips = page.getByRole("navigation", { name: "Kategorien" });

    await chips.getByRole("link", { name: "SALATE" }).click();

    await expect(page.getByRole("heading", { name: "SALATE", level: 2 })).toBeInViewport();
    await expect(chips.getByRole("link", { name: "SALATE" })).toHaveAttribute("aria-current", "true");
    await expect(page).toHaveURL(/#salate$/);
    await expect(chips).toBeInViewport();
  });

  test("opens straight at a category after a reload", async ({ page }) => {
    await page.goto("/menu#dips");
    await page.reload();

    await expect(page.getByRole("heading", { name: "DIPS", level: 2 })).toBeInViewport();
  });

  test("searches the menu", async ({ page }) => {
    await page.goto("/menu");
    const search = page.getByRole("searchbox", { name: "Gericht suchen" });

    await search.fill("süßkartoffel");
    await expect(page.getByText("1 Treffer")).toBeVisible();
    await expect(page.locator("[id^='gericht-']")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "SÜSSKARTOFFEL POMMES" })).toBeVisible();

    await search.fill("chicken");
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "CHICKEN & VEGGIE BURGERS",
      "HAUPTGERICHTE & FINGER FOOD",
      "BURGER PUR MIT PLATTE",
      "SALATE",
      "TISCH RESERVIEREN.",
    ]);

    await search.fill("pizza");
    await expect(page.getByText("Nichts gefunden für „pizza“")).toBeVisible();
    await page.getByRole("button", { name: "Suche zurücksetzen" }).click();
    await expect(page.locator("[id^='gericht-']")).toHaveCount(44);
  });

  test("explains when the menu can't load and recovers on retry", async ({ page }) => {
    await page.route("**/api/food", (route) =>
      route.fulfill({ status: 500, json: { status: "error", message: "boom" } }),
    );
    await page.goto("/menu");

    await expect(page.getByRole("alert")).toContainText("Das Menü konnte nicht geladen werden.");

    await page.unroute("**/api/food");
    await page.getByRole("button", { name: "Erneut versuchen" }).click();
    await expect(page.getByRole("heading", { name: "BEEF BURGER", level: 2 })).toBeVisible();
  });

  test("shows the same menu after coming back from another page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "CLASSIC BEEF BURGER 14,50 €" })).toBeAttached();

    let calls = 0;
    page.on("request", (request) => {
      if (request.url().includes("/api/")) calls += 1;
    });

    await page.getByRole("link", { name: "Menü ansehen", exact: true }).click();
    await expect(page.locator("[id^='gericht-']")).toHaveCount(44);
    expect(calls).toBe(0);
  });

  test("has no serious accessibility problems", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator("[id^='gericht-']")).toHaveCount(44);

    await expectNoA11yViolations(page);
  });
});
