import { describe, expect, it } from "vitest";
import { menuRoutes } from "../test/fixtures";
import { deferred, mockApi } from "../test/mockApi";
import { renderApp } from "../test/renderApp";

describe("home page", () => {
  it("shows the hero with both calls to action and the address", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/");

    await expect.element(screen.getByRole("heading", { level: 1 })).toMatchTextContent(/DEIN BURGER\.\s*DEIN PUB\./);
    await expect.element(screen.getByText("Mitten in Milbertshofen.").first()).toBeVisible();
    await expect.element(screen.getByRole("link", { name: "Menü ansehen" })).toHaveAttribute("href", "/menu");
    await expect
      .element(screen.getByRole("main").getByRole("link", { name: "Tisch reservieren" }).first())
      .toHaveAttribute("href", "/contact#reservieren");
    await expect
      .element(screen.getByRole("main").getByRole("link", { name: /Milbertshofener Str\. 34.*Route planen/ }))
      .toHaveAttribute("href", expect.stringContaining("google.com/maps/dir"));
  });

  it("fills the favourites with the menu's dishes that have photos, linking to them", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/");
    const favorites = screen.getByRole("region", { name: "UNSERE FAVORITEN" });

    const classic = favorites.getByRole("link", { name: "CLASSIC BEEF BURGER 14,50 €" });
    await expect.element(classic).toHaveAttribute("href", "/menu#gericht-dish-classic");
    await expect.element(favorites.getByRole("link", { name: "BBQ BEEF BURGER 15,50 €" })).toBeVisible();
    await expect.element(favorites.getByRole("link", { name: /SPICY BEEF BURGER/ })).not.toBeInTheDocument();
  });

  it("shows placeholders while the menu loads", async () => {
    const pending = deferred();
    mockApi(menuRoutes({ "GET /api/food": () => pending.promise }));
    const screen = await renderApp("/");

    await expect.element(screen.getByRole("link", { name: /CLASSIC BEEF BURGER/ })).not.toBeInTheDocument();
    pending.resolve(menuRoutes()["GET /api/food"]);
    await expect.element(screen.getByRole("link", { name: "CLASSIC BEEF BURGER 14,50 €" })).toBeVisible();
  });

  it("falls back to the static favourites when the API is down", async () => {
    mockApi(menuRoutes({ "GET /api/food": new TypeError("Failed to fetch") }));
    const screen = await renderApp("/");
    const favorites = screen.getByRole("region", { name: "UNSERE FAVORITEN" });

    await expect.element(favorites.getByRole("link", { name: "Classic Burger" })).toHaveAttribute("href", "/menu");
  });

  it("opens the menu from a favourite", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/");

    // traka se stalno pomiče, pa za Playwright nikad nije "stable"
    await screen.getByRole("link", { name: "CLASSIC BEEF BURGER 14,50 €" }).click({ force: true });

    await expect.element(screen.getByRole("heading", { level: 1 })).toMatchTextContent(/UNSER\s*MENU/);
    expect(screen.router.state.location.hash).toBe("#gericht-dish-classic");
  });
});

describe("unknown pages", () => {
  it("show a 404 page with a way back", async () => {
    mockApi(menuRoutes());
    const screen = await renderApp("/gibt-es-nicht");

    await expect.element(screen.getByRole("heading", { level: 1 })).toHaveTextContent("HIER GIBT'S KEINE BURGER.");
    await expect.element(screen.getByRole("link", { name: "Zur Startseite" })).toHaveAttribute("href", "/");
    await screen.getByRole("link", { name: "Zum Menü" }).click();
    expect(screen.router.state.location.pathname).toBe("/menu");
  });
});
