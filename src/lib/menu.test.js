import { describe, expect, it } from "vitest";
import { buildMenu, countItems, dishAnchor, filterMenu, normalizeText, pickFavorites } from "./menu";

const beef = { _id: "c1", name: "BEEF BURGER", slug: "beefBurger", order: 1 };
const sides = { _id: "c2", name: "BEILAGEN", slug: "beilagen", order: 2 };
const empty = { _id: "c3", name: "LEER", slug: "leer", order: 3 };

const food = [
  { _id: "f1", name: "CLASSIC BEEF BURGER", description: "Cheddar, Salat", price: 14.5, image: "/a.jpg", order: 1, category: beef },
  { _id: "f2", name: "SÜSSKARTOFFEL POMMES", description: "Knusprige Süßkartoffel-Pommes", price: 5.5, image: "", order: 2, category: sides },
  { _id: "f3", name: "WEDGES", description: "Gewürzte Kartoffel-Wedges", price: 5, image: "", order: 1, category: sides },
  { _id: "f4", name: "BBQ BEEF BURGER", description: "Röstzwiebeln", price: 15.5, image: "/b.jpg", order: 2, category: beef },
  { _id: "f5", name: "ORPHAN", description: "", price: 1, image: "/c.jpg", order: 0, category: null },
];

describe("buildMenu", () => {
  it("makes one section per category, in the categories' order, keeping the API's dish order", () => {
    const sections = buildMenu([beef, sides], food);

    expect(sections.map((section) => section.slug)).toEqual(["beefBurger", "beilagen"]);
    expect(sections[0].items.map((item) => item._id)).toEqual(["f1", "f4"]);
    expect(sections[1]).toMatchObject({ id: "c2", title: "BEILAGEN" });
  });

  it("leaves out categories without dishes and dishes without a category", () => {
    const sections = buildMenu([beef, sides, empty], food);

    expect(sections.map((section) => section.slug)).not.toContain("leer");
    expect(countItems(sections)).toBe(4);
  });

  it("copes with nothing loaded yet", () => {
    expect(buildMenu()).toEqual([]);
  });
});

describe("normalizeText", () => {
  it("ignores case, accents and ß", () => {
    expect(normalizeText("  Süßkartoffel JALAPEÑOS ")).toBe("susskartoffel jalapenos");
  });
});

describe("filterMenu", () => {
  const sections = buildMenu([beef, sides], food);

  it("returns every section for an empty query", () => {
    expect(filterMenu(sections, "  ")).toBe(sections);
  });

  it("matches names and descriptions, ignoring umlauts and case", () => {
    const result = filterMenu(sections, "susskartoffel");

    expect(result).toHaveLength(1);
    expect(result[0].items.map((item) => item.name)).toEqual(["SÜSSKARTOFFEL POMMES"]);
    expect(countItems(filterMenu(sections, "röstzwiebeln"))).toBe(1);
  });

  it("drops sections with no match", () => {
    expect(filterMenu(sections, "burger").map((section) => section.slug)).toEqual(["beefBurger"]);
    expect(filterMenu(sections, "pizza")).toEqual([]);
  });
});

describe("pickFavorites", () => {
  it("takes dishes with a photo, ordered by category, then by dish order", () => {
    const favorites = pickFavorites([beef, sides], food);

    expect(favorites.map((item) => item._id)).toEqual(["f1", "f4", "f5"]);
  });

  it("respects the limit", () => {
    expect(pickFavorites([beef, sides], food, 1).map((item) => item._id)).toEqual(["f1"]);
  });

  it("doesn't reorder the array it was given", () => {
    const copy = [...food];
    pickFavorites([sides, beef], copy);

    expect(copy.map((item) => item._id)).toEqual(food.map((item) => item._id));
  });
});

describe("dishAnchor", () => {
  it("is a stable id built from the dish's _id", () => {
    expect(dishAnchor({ _id: "abc" })).toBe("gericht-abc");
  });
});
