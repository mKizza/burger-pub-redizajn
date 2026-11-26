import { beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { categories, fakeToken, food, menuRoutes } from "../../test/fixtures";
import { deferred, mockApi } from "../../test/mockApi";
import { renderApp } from "../../test/renderApp";

const PNG_1PX = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="),
  (char) => char.charCodeAt(0),
);

function savedDish(fields, id = "dish-new") {
  const category = categories.find((item) => item._id === fields.category);
  return {
    _id: id,
    name: fields.name,
    description: fields.description ?? "",
    price: Number(fields.price),
    image: fields.image ? "https://ik.imagekit.io/test/new.png" : "",
    order: Number(fields.order ?? 0),
    category,
  };
}

async function renderAdmin(routes = {}) {
  localStorage.setItem("token", fakeToken());
  const api = mockApi({ ...menuRoutes(), ...routes });
  const screen = await renderApp("/admin");

  await expect.element(screen.getByRole("heading", { name: "BEEF BURGER", level: 2 })).toBeVisible();

  return { api, screen };
}

describe("admin login", () => {
  it("sends someone without a token to the login", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/admin");

    await expect.element(screen.getByRole("heading", { name: "ADMIN" })).toBeVisible();
    expect(screen.router.state.location.pathname).toBe("/admin-login");
    await expect.element(screen.getByText("Sesija je istekla. Prijavite se ponovno.")).not.toBeInTheDocument();
  });

  it("says the session expired when the stored token has", async () => {
    localStorage.setItem("token", fakeToken(-60));
    mockApi(menuRoutes());
    const screen = await renderApp("/admin");

    await expect.element(screen.getByText("Sesija je istekla. Prijavite se ponovno.")).toBeVisible();
  });

  it("asks for both fields before calling the API", async () => {
    const api = mockApi(menuRoutes());
    const screen = await renderApp("/admin-login");

    await screen.getByRole("button", { name: "Prijavi se" }).click();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Unesite korisničko ime i lozinku");
    expect(api.callsTo("POST", "/api/auth/login")).toHaveLength(0);
  });

  it("shows the API's message for a wrong password", async () => {
    mockApi(
      menuRoutes({
        "POST /api/auth/login": {
          status: 401,
          json: { status: "fail", message: "Pogrešno korisničko ime ili lozinka" },
        },
      }),
    );
    const screen = await renderApp("/admin-login");

    await screen.getByLabelText("Korisničko ime").fill("admin");
    await screen.getByLabelText("Lozinka", { exact: true }).fill("falsch");
    await screen.getByRole("button", { name: "Prijavi se" }).click();

    await expect.element(screen.getByRole("alert")).toHaveTextContent("Pogrešno korisničko ime ili lozinka");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("shows and hides the password", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/admin-login");
    const password = screen.getByLabelText("Lozinka", { exact: true });

    await expect.element(password).toHaveAttribute("type", "password");
    await screen.getByRole("button", { name: "Prikaži lozinku" }).click();
    await expect.element(password).toHaveAttribute("type", "text");
  });

  it("stores the token, opens the admin and confirms with a toast, not an alert", async () => {
    const token = fakeToken();
    const pending = deferred();
    const api = mockApi(menuRoutes({ "POST /api/auth/login": () => pending.promise }));
    const screen = await renderApp("/admin-login");

    await screen.getByLabelText("Korisničko ime").fill(" admin ");
    await screen.getByLabelText("Lozinka", { exact: true }).fill("geheim123");
    await screen.getByRole("button", { name: "Prijavi se" }).click();
    await expect.element(screen.getByRole("button", { name: "Prijava …" })).toBeDisabled();
    pending.resolve({ json: { status: "success", token } });

    await expect.element(screen.getByRole("heading", { name: "MENU", level: 1 })).toBeVisible();
    await expect.element(screen.getByText("Uspješno ste prijavljeni")).toBeVisible();
    expect(localStorage.getItem("token")).toBe(token);
    expect(api.callsTo("POST", "/api/auth/login")[0].body).toEqual({ username: "admin", password: "geheim123" });
  });
});

describe("admin dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lists every category with its dishes, empty ones included", async () => {
    const { screen } = await renderAdmin();

    await expect.element(screen.getByText(/5 proizvoda · 4 kategorije · 3 bez slike/)).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "CLASSIC BEEF BURGER" })).toBeVisible();
    await expect.element(screen.getByText("14,50 €").first()).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "SAISONAL" })).toBeVisible();
    await expect.element(screen.getByText("Nema jela u ovoj kategoriji.")).toBeVisible();
  });

  it("searches and filters by category", async () => {
    const { screen } = await renderAdmin();

    await screen.getByRole("searchbox", { name: "Pretraži jela" }).fill("sauce");
    await expect.element(screen.getByRole("heading", { name: "BBQ SAUCE" })).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "BBQ BEEF BURGER" })).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "CLASSIC BEEF BURGER" })).not.toBeInTheDocument();

    await screen.getByRole("searchbox", { name: "Pretraži jela" }).fill("");
    await screen.getByRole("combobox", { name: "Filtriraj po kategoriji" }).selectOptions("DIPS");
    await expect.element(screen.getByRole("heading", { name: "BBQ SAUCE" })).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "BEEF BURGER", level: 2 })).not.toBeInTheDocument();

    await screen.getByRole("searchbox", { name: "Pretraži jela" }).fill("pizza");
    await expect.element(screen.getByText("Nema rezultata za „pizza“")).toBeVisible();
  });

  it("adds a dish at the end of its category, with a comma price", async () => {
    const { api, screen } = await renderAdmin({
      "POST /api/food": ({ body }) => ({ status: 201, json: { status: "success", data: { food: savedDish(body) } } }),
    });

    await screen.getByRole("button", { name: "Dodaj jelo u kategoriju BEEF BURGER" }).click();
    const dialog = screen.getByRole("dialog", { name: "Dodaj novo jelo" });
    await expect.element(dialog.getByRole("combobox", { name: "Kategorija" })).toHaveValue("cat-beef");

    await dialog.getByRole("textbox", { name: "Naziv" }).fill("TRÜFFEL BURGER");
    await dialog.getByRole("textbox", { name: "Opis" }).fill("Trüffelmayo, Rucola");
    await dialog.getByRole("textbox", { name: "Cijena €" }).fill("19,90");
    await dialog.getByRole("button", { name: "Dodaj jelo" }).click();

    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(screen.getByRole("heading", { name: "TRÜFFEL BURGER" })).toBeVisible();
    await expect.element(screen.getByText("„TRÜFFEL BURGER“ je dodano")).toBeVisible();

    const [call] = api.callsTo("POST", "/api/food");
    expect(call.headers.Authorization).toMatch(/^Bearer /);
    expect(call.body).toEqual({
      name: "TRÜFFEL BURGER",
      description: "Trüffelmayo, Rucola",
      price: "19.9",
      category: "cat-beef",
      order: "4",
    });
  });

  it("explains what's missing in the dish form", async () => {
    const { api, screen } = await renderAdmin();

    await screen.getByRole("button", { name: "Dodaj novo" }).click();
    const dialog = screen.getByRole("dialog", { name: "Dodaj novo jelo" });
    await dialog.getByRole("textbox", { name: "Cijena €" }).fill("zwölf");
    await dialog.getByRole("button", { name: "Dodaj jelo" }).click();

    await expect.element(dialog.getByText("Unesite naziv jela.")).toBeVisible();
    await expect.element(dialog.getByText("Cijena mora biti broj, npr. 14,50.")).toBeVisible();
    await expect.element(dialog.getByText("Odaberite kategoriju.")).toBeVisible();
    await expect.element(dialog.getByRole("textbox", { name: "Naziv" })).toHaveFocus();
    expect(api.callsTo("POST", "/api/food")).toHaveLength(0);
  });

  it("previews a chosen photo, refuses other file types and uploads it", async () => {
    const { api, screen } = await renderAdmin({
      "PATCH /api/food/:id": ({ body, params }) => ({
        json: { status: "success", data: { food: { ...savedDish(body, params.id), image: "https://ik.imagekit.io/test/new.png" } } },
      }),
    });

    await screen.getByRole("button", { name: "Uredi: SPICY BEEF BURGER" }).click();
    const dialog = screen.getByRole("dialog", { name: "Uredi jelo" });
    await expect.element(dialog.getByRole("textbox", { name: "Cijena €" })).toHaveValue("15,50");

    const input = dialog.getByLabelText(/Odaberi sliku/);
    await input.upload(new File(["GIF89a"], "anim.gif", { type: "image/gif" }));
    await expect.element(dialog.getByText("Dozvoljene su samo slike JPEG, PNG ili WebP.")).toBeVisible();

    await input.upload(new File([PNG_1PX], "spicy.png", { type: "image/png" }));
    await expect.element(dialog.getByText("spicy.png")).toBeVisible();
    await expect.element(dialog.getByText("Dozvoljene su samo slike JPEG, PNG ili WebP.")).not.toBeInTheDocument();

    await dialog.getByRole("button", { name: "Spremi promjene" }).click();
    await expect.element(screen.getByText("„SPICY BEEF BURGER“ je spremljeno")).toBeVisible();

    const [call] = api.callsTo("PATCH", "/api/food/dish-spicy");
    expect(call.body.image).toBeInstanceOf(File);
    expect(call.body.image.name).toBe("spicy.png");
    expect(call.body.order).toBeUndefined();
  });

  it("keeps the dialog open and explains a failed save", async () => {
    const { screen } = await renderAdmin({
      "PATCH /api/food/:id": { status: 400, json: { status: "fail", message: "Cast to Number failed" } },
    });

    await screen.getByRole("button", { name: "Uredi: BBQ SAUCE" }).click();
    const dialog = screen.getByRole("dialog", { name: "Uredi jelo" });
    await dialog.getByRole("button", { name: "Spremi promjene" }).click();

    await expect.element(dialog.getByRole("alert")).toHaveTextContent("Cast to Number failed");
    await expect.element(dialog.getByRole("button", { name: "Spremi promjene" })).toBeEnabled();
  });

  it("closes the dialog with Escape without saving", async () => {
    const { api, screen } = await renderAdmin();

    await screen.getByRole("button", { name: "Uredi: BBQ SAUCE" }).click();
    await expect.element(screen.getByRole("dialog", { name: "Uredi jelo" })).toBeVisible();
    await userEvent.keyboard("{Escape}");

    await expect.element(screen.getByRole("dialog", { name: "Uredi jelo" })).not.toBeInTheDocument();
    expect(api.calls.filter((call) => call.method !== "GET")).toHaveLength(0);
  });

  it("deletes a dish only after confirming", async () => {
    const { api, screen } = await renderAdmin({ "DELETE /api/food/:id": { status: 204 } });

    await screen.getByRole("button", { name: "Obriši: CLASSIC BEEF BURGER" }).click();
    const confirm = screen.getByRole("alertdialog", { name: "Obrisati jelo?" });
    await expect.element(confirm).toMatchTextContent(/„CLASSIC BEEF BURGER“ bit će trajno uklonjeno s jelovnika, zajedno sa slikom/);

    await confirm.getByRole("button", { name: "Odustani" }).click();
    await expect.element(screen.getByRole("heading", { name: "CLASSIC BEEF BURGER" })).toBeVisible();
    expect(api.callsTo("DELETE", "/api/food/dish-classic")).toHaveLength(0);

    await screen.getByRole("button", { name: "Obriši: CLASSIC BEEF BURGER" }).click();
    await screen.getByRole("alertdialog").getByRole("button", { name: "Obriši" }).click();

    await expect.element(screen.getByRole("heading", { name: "CLASSIC BEEF BURGER" })).not.toBeInTheDocument();
    await expect.element(screen.getByText("„CLASSIC BEEF BURGER“ je obrisano")).toBeVisible();
    expect(api.callsTo("DELETE", "/api/food/dish-classic")).toHaveLength(1);
  });

  it("logs out and sends back to the login when the API refuses the token", async () => {
    const { screen } = await renderAdmin({
      "DELETE /api/food/:id": { status: 401, json: { status: "fail", message: "Nevažeći ili istekli token" } },
    });

    await screen.getByRole("button", { name: "Obriši: BBQ SAUCE" }).click();
    await screen.getByRole("alertdialog").getByRole("button", { name: "Obriši" }).click();

    await expect.element(screen.getByText("Sesija je istekla. Prijavite se ponovno.")).toBeVisible();
    expect(screen.router.state.location.pathname).toBe("/admin-login");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("logs out", async () => {
    const { screen } = await renderAdmin();

    await screen.getByRole("button", { name: "Odjava" }).click();

    await expect.element(screen.getByRole("button", { name: "Prijavi se" })).toBeVisible();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("offers a retry when the data can't be loaded", async () => {
    let fail = true;
    const routes = menuRoutes();
    localStorage.setItem("token", fakeToken());
    mockApi({ ...routes, "GET /api/food": () => (fail ? new TypeError("Failed to fetch") : routes["GET /api/food"]) });
    const screen = await renderApp("/admin");

    await expect.element(screen.getByRole("alert")).toMatchTextContent(/Podaci se nisu mogli učitati/);
    fail = false;
    await screen.getByRole("button", { name: "Pokušaj ponovno" }).click();
    await expect.element(screen.getByRole("heading", { name: "BEEF BURGER", level: 2 })).toBeVisible();
  });
});

describe("categories dialog", () => {
  it("adds a category with a unique slug after the last one", async () => {
    const { api, screen } = await renderAdmin({
      "POST /api/categories": ({ body }) => ({
        status: 201,
        json: { status: "success", data: { category: { _id: "cat-new", ...body } } },
      }),
    });

    await screen.getByRole("button", { name: "Kategorije" }).click();
    const dialog = screen.getByRole("dialog", { name: "Kategorije" });
    await dialog.getByRole("textbox", { name: "Naziv nove kategorije" }).fill("Dips");
    await dialog.getByRole("button", { name: "Dodaj" }).click();

    await expect.element(screen.getByText("Kategorija „Dips“ je dodana")).toBeVisible();
    await expect.element(dialog.getByRole("textbox", { name: "Naziv nove kategorije" })).toHaveValue("");
    expect(api.callsTo("POST", "/api/categories")[0].body).toEqual({ name: "Dips", slug: "dips-2", order: 5 });
  });

  it("only lets empty categories be deleted, after confirming", async () => {
    const { api, screen } = await renderAdmin({ "DELETE /api/categories/:id": { status: 204 } });

    await screen.getByRole("button", { name: "Kategorije" }).click();
    const dialog = screen.getByRole("dialog", { name: "Kategorije" });

    await expect.element(dialog.getByRole("button", { name: "Obriši: BEEF BURGER" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Obriši: SAISONAL" }).click();
    await screen.getByRole("alertdialog", { name: "Obrisati kategoriju?" }).getByRole("button", { name: "Obriši" }).click();

    await expect.element(screen.getByText("Kategorija „SAISONAL“ je obrisana")).toBeVisible();
    await expect.element(dialog.getByText("SAISONAL")).not.toBeInTheDocument();
    expect(api.callsTo("DELETE", "/api/categories/cat-empty")).toHaveLength(1);
  });

  it("renames a category in place", async () => {
    const { api, screen } = await renderAdmin({
      "PATCH /api/categories/:id": ({ body, params }) => ({
        json: { status: "success", data: { category: { ...categories.find((c) => c._id === params.id), ...body } } },
      }),
    });

    await screen.getByRole("button", { name: "Kategorije" }).click();
    const dialog = screen.getByRole("dialog", { name: "Kategorije" });
    await dialog.getByRole("button", { name: "Preimenuj: DIPS" }).click();

    const input = dialog.getByRole("textbox", { name: "Novi naziv za DIPS" });
    await expect.element(input).toHaveFocus();
    await input.fill("SAUCEN & DIPS");
    await dialog.getByRole("button", { name: "Spremi" }).click();

    await expect.element(dialog.getByText("SAUCEN & DIPS")).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "SAUCEN & DIPS", level: 2 })).toBeInTheDocument();
    expect(api.callsTo("PATCH", "/api/categories/cat-dips")[0].body).toEqual({ name: "SAUCEN & DIPS" });
  });

  it("moves a category up by swapping orders", async () => {
    const { api, screen } = await renderAdmin({
      "PATCH /api/categories/:id": { json: { status: "success", data: { category: null } } },
    });

    await screen.getByRole("button", { name: "Kategorije" }).click();
    const dialog = screen.getByRole("dialog", { name: "Kategorije" });

    await expect.element(dialog.getByRole("button", { name: "Pomakni gore: BEEF BURGER" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Pomakni gore: DIPS" }).click();

    await expect.poll(() => api.calls.filter((call) => call.method === "PATCH").length).toBe(2);
    expect(api.callsTo("PATCH", "/api/categories/cat-dips")[0].body).toEqual({ order: 2 });
    expect(api.callsTo("PATCH", "/api/categories/cat-sides")[0].body).toEqual({ order: 3 });

    const names = () => dialog.getByRole("listitem").elements().map((item) => item.querySelector("p")?.textContent);
    await expect.poll(names).toEqual(["BEEF BURGER", "DIPS", "BEILAGEN", "SAISONAL"]);
    expect(food).toHaveLength(5);
  });
});
