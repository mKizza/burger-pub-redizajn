import { ADMIN, expect, expectNoA11yViolations, loginWithToken, test } from "./support";

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function menuSection(page, slug) {
  return page.locator(`section#${slug}`);
}

test.describe("admin login", () => {
  test("guards the admin and logs in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login$/);

    await page.getByLabel("Korisničko ime").fill(ADMIN.username);
    await page.getByLabel("Lozinka", { exact: true }).fill("falsch-falsch");
    await page.getByRole("button", { name: "Prijavi se" }).click();
    await expect(page.getByRole("alert")).toHaveText("Pogrešno korisničko ime ili lozinka");

    await page.getByLabel("Lozinka", { exact: true }).fill(ADMIN.password);
    await page.getByRole("button", { name: "Prijavi se" }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText("Uspješno ste prijavljeni")).toBeVisible();
    await expect(page.getByText(/44 proizvoda · 7 kategorija · 39 bez slike/)).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: "MENU", level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "Odjava" }).click();
    await expect(page).toHaveURL(/\/admin-login$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login$/);
  });

  test("sends an admin whose session ended back to the login", async ({ page, backend }) => {
    await loginWithToken(page, backend);

    await backend.reset();
    await page.getByRole("button", { name: "Obriši: BBQ SAUCE" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Obriši" }).click();

    await expect(page).toHaveURL(/\/admin-login$/);
    await expect(page.getByText("Sesija je istekla. Prijavite se ponovno.")).toBeVisible();
  });
});

test.describe("managing the menu", () => {
  test("a new dish appears at the end of its category on the menu", async ({ page, backend }) => {
    await loginWithToken(page, backend);

    await page.getByRole("button", { name: "Dodaj jelo u kategoriju BEEF BURGER" }).click();
    const dialog = page.getByRole("dialog", { name: "Dodaj novo jelo" });
    await dialog.getByRole("textbox", { name: "Naziv" }).fill("TRÜFFEL BURGER");
    await dialog.getByRole("textbox", { name: "Opis" }).fill("Trüffelmayo, Rucola, Parmesan");
    await dialog.getByRole("textbox", { name: "Cijena €" }).fill("19,90");
    await dialog.getByRole("button", { name: "Dodaj jelo" }).click();

    await expect(page.getByText("„TRÜFFEL BURGER“ je dodano")).toBeVisible();
    await expect(page.getByRole("heading", { name: "TRÜFFEL BURGER" })).toBeVisible();

    await page.goto("/menu");
    const lastBeef = menuSection(page, "beefBurger").getByRole("listitem").last();
    await expect(lastBeef).toContainText("TRÜFFEL BURGER");
    await expect(lastBeef).toContainText("19,90 €");
    await expect(lastBeef).toContainText("Trüffelmayo, Rucola, Parmesan");
  });

  test("an edited price shows on the menu", async ({ page, backend }) => {
    await loginWithToken(page, backend);

    await page.getByRole("button", { name: "Uredi: CHILI CHEESE SAUCE" }).click();
    const dialog = page.getByRole("dialog", { name: "Uredi jelo" });
    await expect(dialog.getByRole("textbox", { name: "Cijena €" })).toHaveValue("2,00");
    await dialog.getByRole("textbox", { name: "Cijena €" }).fill("2,50");
    await dialog.getByRole("button", { name: "Spremi promjene" }).click();
    await expect(page.getByText("„CHILI CHEESE SAUCE“ je spremljeno")).toBeVisible();

    await page.goto("/menu#dips");
    await expect(menuSection(page, "dips").getByRole("listitem").filter({ hasText: "CHILI CHEESE SAUCE" })).toContainText(
      "2,50 €",
    );
  });

  test("a photo turns a dish into a photo card, and a new photo replaces the old one", async ({ page, backend }) => {
    await loginWithToken(page, backend);

    await page.getByRole("button", { name: "Uredi: SPICY BEEF BURGER" }).click();
    let dialog = page.getByRole("dialog", { name: "Uredi jelo" });
    await dialog.getByLabel(/Odaberi sliku/).setInputFiles({ name: "spicy.png", mimeType: "image/png", buffer: PNG_1PX });
    await expect(dialog.getByText("spicy.png")).toBeVisible();
    await dialog.getByRole("button", { name: "Spremi promjene" }).click();
    await expect(page.getByText("„SPICY BEEF BURGER“ je spremljeno")).toBeVisible();

    await page.getByRole("button", { name: "Uredi: SPICY BEEF BURGER" }).click();
    dialog = page.getByRole("dialog", { name: "Uredi jelo" });
    await expect(dialog.getByText("Trenutna slika ostaje")).toBeVisible();
    await dialog.getByLabel(/Promijeni sliku/).setInputFiles({ name: "spicy-2.png", mimeType: "image/png", buffer: PNG_1PX });
    await dialog.getByRole("button", { name: "Spremi promjene" }).click();
    await expect(dialog).toBeHidden();

    const images = await backend.images();
    expect(images.map(({ fileName, deleted }) => [fileName.replace(/^food-\d+-/, ""), deleted])).toEqual([
      ["spicy.png", true],
      ["spicy-2.png", false],
    ]);

    await page.goto("/menu");
    const card = page.getByRole("article").filter({ hasText: "SPICY BEEF BURGER" });
    await expect(card.getByRole("img", { name: "SPICY BEEF BURGER" })).toHaveAttribute("src", /\/__e2e\/images\//);
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(6);
  });

  test("a deleted dish disappears from the menu", async ({ page, backend }) => {
    await loginWithToken(page, backend);

    await page.getByRole("button", { name: "Obriši: ONION RINGS" }).first().click();
    const confirm = page.getByRole("alertdialog", { name: "Obrisati jelo?" });
    await expect(confirm).toContainText("„ONION RINGS“ bit će trajno uklonjeno");
    await confirm.getByRole("button", { name: "Obriši" }).click();
    await expect(page.getByText("„ONION RINGS“ je obrisano")).toBeVisible();

    await page.goto("/menu");
    await expect(page.locator("[id^='gericht-']")).toHaveCount(43);
    await expect(page.getByRole("heading", { name: "ONION RINGS" })).toHaveCount(1);
  });

  test("categories can be added, renamed, reordered and deleted", async ({ page, backend }) => {
    await loginWithToken(page, backend);
    await page.getByRole("button", { name: "Kategorije" }).click();
    const dialog = page.getByRole("dialog", { name: "Kategorije" });

    await dialog.getByRole("textbox", { name: "Naziv nove kategorije" }).fill("Saisonal");
    await dialog.getByRole("button", { name: "Dodaj" }).click();
    await expect(page.getByText("Kategorija „Saisonal“ je dodana")).toBeVisible();

    await dialog.getByRole("button", { name: "Preimenuj: DIPS" }).click();
    await dialog.getByRole("textbox", { name: "Novi naziv za DIPS" }).fill("SAUCEN & DIPS");
    await dialog.getByRole("button", { name: "Spremi" }).click();
    await expect(page.getByText("Kategorija je preimenovana")).toBeVisible();

    await dialog.getByRole("button", { name: "Pomakni gore: SAUCEN & DIPS" }).click();
    await expect(dialog.getByRole("button", { name: "Pomakni gore: SAUCEN & DIPS" })).toBeEnabled();

    await expect(dialog.getByRole("button", { name: "Obriši: BEEF BURGER" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Obriši: Saisonal" }).click();
    await page.getByRole("alertdialog", { name: "Obrisati kategoriju?" }).getByRole("button", { name: "Obriši" }).click();
    await expect(page.getByText("Kategorija „Saisonal“ je obrisana")).toBeVisible();

    await page.goto("/menu");
    const headings = page.getByRole("main").getByRole("heading", { level: 2 });
    await expect(headings).toHaveText([
      "BEEF BURGER",
      "CHICKEN & VEGGIE BURGERS",
      "HAUPTGERICHTE & FINGER FOOD",
      "BURGER PUR MIT PLATTE",
      "SALATE",
      "SAUCEN & DIPS",
      "BEILAGEN",
      "TISCH RESERVIEREN.",
    ]);
  });

  test("the login and the dashboard have no serious accessibility problems", async ({ page, backend }) => {
    await page.goto("/admin-login");
    await expectNoA11yViolations(page);

    await loginWithToken(page, backend);
    await expectNoA11yViolations(page);
  });
});
