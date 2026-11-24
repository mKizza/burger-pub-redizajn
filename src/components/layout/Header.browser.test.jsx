import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { menuRoutes } from "../../test/fixtures";
import { mockApi } from "../../test/mockApi";
import { renderApp } from "../../test/renderApp";

beforeEach(() => {
  mockApi(menuRoutes());
});

describe("header on a desktop", () => {
  it("shows the three links and marks the current page", async () => {
    const screen = await renderApp("/menu");
    const nav = screen.getByRole("navigation", { name: "Hauptnavigation" });

    await expect.element(nav.getByRole("link", { name: "HOME" })).toBeVisible();
    await expect.element(nav.getByRole("link", { name: "MENU" })).toHaveAttribute("aria-current", "page");
    await expect.element(nav.getByRole("link", { name: "KONTAKT | RESERVIEREN" })).toHaveAttribute("href", "/contact");
  });

  it("has a skip link to the main content", async () => {
    const screen = await renderApp("/");
    const skip = screen.getByRole("link", { name: "Zum Inhalt springen" });

    await expect.element(skip).toHaveAttribute("href", "#inhalt");
    await expect.element(screen.getByRole("main")).toHaveAttribute("id", "inhalt");
  });

  it("goes solid once the page scrolls", async () => {
    const screen = await renderApp("/menu");
    const header = screen.getByRole("banner");

    await expect.element(header).toHaveClass(/border-transparent/);
    window.scrollTo(0, 400);
    await expect.element(header).toHaveClass(/bg-ink/);
  });
});

describe("header on a phone", () => {
  beforeEach(async () => {
    await page.viewport(390, 844);
  });

  afterEach(async () => {
    await page.viewport(1280, 800);
  });

  it("hides the desktop links and offers a reservation shortcut", async () => {
    const screen = await renderApp("/");

    await expect
      .element(screen.getByRole("navigation", { name: "Hauptnavigation", includeHidden: true }))
      .not.toBeVisible();
    await expect.element(screen.getByRole("link", { name: "RESERVIEREN", exact: true })).toHaveAttribute(
      "href",
      "/contact#reservieren",
    );
  });

  it("opens the menu, closes it with Escape and gives focus back", async () => {
    const screen = await renderApp("/");
    const toggle = screen.getByRole("button", { name: "Menü öffnen" });

    await toggle.click();
    const dialog = screen.getByRole("dialog", { name: "Menü" });
    await expect.element(dialog).toBeVisible();
    await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
    await expect.element(dialog.getByRole("button", { name: "Menü schließen" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
    await expect.element(toggle).toHaveFocus();
  });

  it("closes the menu when the window grows to the desktop layout", async () => {
    const screen = await renderApp("/");

    await screen.getByRole("button", { name: "Menü öffnen" }).click();
    await expect.element(screen.getByRole("dialog", { name: "Menü" })).toBeVisible();

    await page.viewport(1024, 800);
    await expect.element(screen.getByRole("dialog", { name: "Menü", includeHidden: true })).not.toHaveAttribute("open");
    await screen.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "MENU" }).click();
    expect(screen.router.state.location.pathname).toBe("/menu");
  });

  it("navigates from the menu and closes it", async () => {
    const screen = await renderApp("/");

    await screen.getByRole("button", { name: "Menü öffnen" }).click();
    await screen
      .getByRole("navigation", { name: "Mobile Navigation" })
      .getByRole("link", { name: "MENU" })
      .click();

    await expect.element(screen.getByRole("heading", { level: 1 })).toMatchTextContent(/UNSER\s*MENU/);
    expect(screen.router.state.location.pathname).toBe("/menu");
    await expect.element(screen.getByRole("dialog", { name: "Menü" })).not.toBeInTheDocument();
  });
});
