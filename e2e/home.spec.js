import { expect, expectNoA11yViolations, test } from "./support";

test.describe("home page", () => {
  test("shows the hero and the favourites from the real menu", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Burger Pub München");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DEIN BURGER.");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("DEIN PUB.");

    const favorites = page.getByRole("region", { name: "UNSERE FAVORITEN" });
    for (const name of ["CLASSIC BEEF BURGER 14,50 €", "CHEESE BURGER 15,00 €", "DOUBLE BEEF BURGER 18,50 €"]) {
      await expect(favorites.getByRole("link", { name })).toBeAttached();
    }
  });

  test("leads to the menu and to the reservation", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Menü ansehen", exact: true }).click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page).toHaveTitle("Menü | Burger Pub München");

    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Tisch reservieren" }).first().click();
    await expect(page).toHaveURL(/\/contact#reservieren$/);
    await expect(page.getByRole("heading", { name: "Tisch reservieren." })).toBeInViewport();
  });

  test("opens a favourite on the menu and highlights it", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("region", { name: "UNSERE FAVORITEN" })
      .getByRole("link", { name: "BBQ BEEF BURGER 15,50 €" })
      .click({ force: true });

    await expect(page).toHaveURL(/\/menu#gericht-/);
    const card = page.getByRole("article").filter({ hasText: "BBQ BEEF BURGER" });
    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/animate-flash/);
  });

  test("lets keyboard users skip to the content", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Zum Inhalt springen" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#inhalt$/);
  });

  test("has a footer with working contact links", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");

    await expect(footer.getByRole("link", { name: "+49 89 32795957" })).toHaveAttribute("href", "tel:+498932795957");
    await expect(footer.getByRole("link", { name: "burgerpubmunchen@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:burgerpubmunchen@gmail.com",
    );
    await footer.getByRole("link", { name: "Menu" }).click();
    await expect(page).toHaveURL(/\/menu$/);
  });

  test("has no serious accessibility problems", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "CLASSIC BEEF BURGER 14,50 €" })).toBeAttached();

    await expectNoA11yViolations(page);
  });
});

test.describe("navigation", () => {
  test("desktop: the header links, with the current page marked", async ({ page, isMobile }) => {
    test.skip(isMobile, "the phone layout has its own menu");

    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Hauptnavigation" });

    await nav.getByRole("link", { name: "MENU" }).click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(nav.getByRole("link", { name: "MENU" })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("link", { name: "KONTAKT | RESERVIEREN" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("KONTAKT");

    await nav.getByRole("link", { name: "HOME" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("phone: the full-screen menu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "only on a phone");

    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Hauptnavigation" })).toBeHidden();

    await page.getByRole("button", { name: "Menü öffnen" }).click();
    const menu = page.getByRole("dialog", { name: "Menü" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "+49 89 32795957" })).toBeVisible();

    await menu.getByRole("link", { name: "KONTAKT" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(menu).toBeHidden();

    await page.getByRole("link", { name: "RESERVIEREN", exact: true }).click();
    await expect(page).toHaveURL(/\/contact#reservieren$/);
    await expect(page.getByRole("heading", { name: "Tisch reservieren." })).toBeInViewport();
  });

  test("scrolls to the top on a new page and restores the position on Back", async ({ page }) => {
    await page.goto("/menu");
    await expect(page.getByRole("heading", { name: "DIPS", level: 2 })).toBeAttached();
    await page.getByRole("heading", { name: "BEILAGEN", level: 2 }).scrollIntoViewIfNeeded();
    const scrolled = await page.evaluate(() => window.scrollY);
    expect(scrolled).toBeGreaterThan(1000);

    await page.getByRole("contentinfo").getByRole("link", { name: "Kontakt" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/menu$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrolled - 50);
  });
});

test.describe("unknown pages", () => {
  test("show a 404 page that leads back", async ({ page }) => {
    await page.goto("/gibt-es-nicht");

    await expect(page).toHaveTitle("Seite nicht gefunden | Burger Pub München");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("HIER GIBT'S KEINE BURGER.");
    await page.getByRole("link", { name: "Zum Menü" }).click();
    await expect(page).toHaveURL(/\/menu$/);
  });
});
