import { describe, expect, it } from "vitest";
import { food, menuRoutes } from "../test/fixtures";
import { deferred, mockApi } from "../test/mockApi";
import { renderApp } from "../test/renderApp";

function sectionHeadings(screen) {
  return screen
    .getByRole("main")
    .getByRole("heading", { level: 2 })
    .elements()
    .map((element) => element.textContent)
    .filter((text) => text !== "TISCH RESERVIEREN.");
}

describe("menu page", () => {
  it("says it's loading, then shows one section per category in order", async () => {
    const pending = deferred();
    mockApi(menuRoutes({ "GET /api/food": () => pending.promise }));
    const screen = await renderApp("/menu");

    await expect.element(screen.getByRole("status").filter({ hasText: "Menü wird geladen" })).toBeInTheDocument();
    pending.resolve(menuRoutes()["GET /api/food"]);

    await expect.element(screen.getByRole("heading", { name: "BEEF BURGER", level: 2 })).toBeVisible();
    expect(sectionHeadings(screen)).toEqual(["BEEF BURGER", "BEILAGEN", "DIPS"]);
  });

  it("leaves out categories without dishes", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/menu");

    await expect.element(screen.getByRole("heading", { name: "DIPS", level: 2 })).toBeVisible();
    await expect.element(screen.getByRole("heading", { name: "SAISONAL" })).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("navigation", { name: "Kategorien" }).getByRole("link", { name: "SAISONAL" }))
      .not.toBeInTheDocument();
  });

  it("shows photo cards for dishes with a photo and a price list for the rest", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/menu");

    const classic = screen.getByRole("article").filter({ hasText: "CLASSIC BEEF BURGER" });
    await expect.element(classic.getByRole("img", { name: "CLASSIC BEEF BURGER" })).toBeVisible();
    await expect.element(classic).toMatchTextContent(/14,50 €/);

    const spicy = screen.getByRole("listitem").filter({ hasText: "SPICY BEEF BURGER" });
    await expect.element(spicy).toMatchTextContent(/15,50 €/);
    await expect.element(spicy).toMatchTextContent(/Jalapeños und scharfe Chili-Sauce/);
    await expect.element(spicy.getByRole("img")).not.toBeInTheDocument();
  });

  it("offers a chip per category that points at its section", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/menu");
    const nav = screen.getByRole("navigation", { name: "Kategorien" });

    await expect.element(nav.getByRole("link", { name: "BEILAGEN" })).toHaveAttribute("href", "#beilagen");
    await nav.getByRole("link", { name: "DIPS" }).click();
    await expect.poll(() => window.location.hash).toBe("#dips");
  });

  it("filters dishes by name and description, ignoring umlauts", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/menu");
    const search = screen.getByRole("searchbox", { name: "Gericht suchen" });

    await expect.element(screen.getByRole("heading", { name: "DIPS", level: 2 })).toBeVisible();
    await search.fill("susskartoffel");

    await expect.element(screen.getByText("1 Treffer")).toBeVisible();
    await expect.element(screen.getByText("SÜSSKARTOFFEL POMMES")).toBeVisible();
    expect(sectionHeadings(screen)).toEqual(["BEILAGEN"]);

    await search.fill("röstzwiebeln");
    await expect.element(screen.getByRole("heading", { name: "BBQ BEEF BURGER" })).toBeVisible();
  });

  it("says when nothing matches and resets the search", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/menu");

    await screen.getByRole("searchbox", { name: "Gericht suchen" }).fill("pizza");
    await expect.element(screen.getByText("Nichts gefunden für „pizza“")).toBeVisible();

    await screen.getByRole("button", { name: "Suche zurücksetzen" }).click();
    await expect.element(screen.getByRole("searchbox", { name: "Gericht suchen" })).toHaveValue("");
    await expect.element(screen.getByRole("heading", { name: "DIPS", level: 2 })).toBeVisible();
  });

  it("clears the search with its button", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/menu");
    const search = screen.getByRole("searchbox", { name: "Gericht suchen" });

    await search.fill("bbq");
    await screen.getByRole("button", { name: "Suche löschen" }).click();
    await expect.element(search).toHaveValue("");
    await expect.element(search).toHaveFocus();
  });

  it("explains a failure and loads again on retry", async () => {
    let fail = true;
    const routes = menuRoutes();
    mockApi({
      ...routes,
      "GET /api/food": () => (fail ? { status: 500, json: { status: "error", message: "boom" } } : routes["GET /api/food"]),
    });
    const screen = await renderApp("/menu");

    const alert = screen.getByRole("alert");
    await expect.element(alert).toMatchTextContent(/Das Menü konnte nicht geladen werden\./);
    await expect.element(alert.getByRole("link", { name: "+49 89 32795957" })).toHaveAttribute("href", "tel:+498932795957");

    fail = false;
    await screen.getByRole("button", { name: "Erneut versuchen" }).click();
    await expect.element(screen.getByRole("heading", { name: "BEEF BURGER", level: 2 })).toBeVisible();
    await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
  });

  it("scrolls a dish from a link into view and highlights it", async () => {
    mockApi(menuRoutes());
    const target = food.find((item) => item._id === "dish-bbq-sauce");
    const screen = await renderApp(`/menu#gericht-${target._id}`);

    const row = screen.getByRole("listitem").filter({ hasText: "BBQ SAUCE" });
    await expect.element(row).toHaveClass(/animate-flash/);
    await expect.element(row).toBeInViewport();
  });
});
