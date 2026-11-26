import { describe, expect, it } from "vitest";
import {
  adminErrorMessage,
  moveCategory,
  nextOrder,
  parsePrice,
  slugify,
  validateDish,
  validateImage,
} from "./admin";
import { ApiError } from "./api";

describe("slugify", () => {
  it("makes URL-safe slugs from German and Croatian names", () => {
    expect(slugify("Hauptgerichte & Finger Food")).toBe("hauptgerichte-finger-food");
    expect(slugify("Süße Grüße")).toBe("suesse-gruesse");
    expect(slugify("Čevapi i đuveč")).toBe("cevapi-i-djuvec");
  });

  it("adds a number when the slug is taken, so the API doesn't refuse a duplicate", () => {
    expect(slugify("Dips", ["dips"])).toBe("dips-2");
    expect(slugify("Dips", ["dips", "dips-2"])).toBe("dips-3");
    expect(slugify("Chicken & Veggie", ["chicken-veggie"])).toBe("chicken-veggie-2");
  });

  it("never returns an empty slug", () => {
    expect(slugify("!!!")).toBe("kategorija");
  });
});

describe("nextOrder", () => {
  it("comes after the highest order, not after the count", () => {
    expect(nextOrder([{ order: 1 }, { order: 7 }, { order: 3 }])).toBe(8);
    expect(nextOrder([])).toBe(1);
    expect(nextOrder([{ order: undefined }])).toBe(1);
  });
});

describe("parsePrice", () => {
  it.each([
    ["14,50", 14.5],
    ["14.5", 14.5],
    [" 9 ", 9],
    ["0", 0],
  ])("reads %s as %s", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(["", "abc", "-1", "1,234", "1.000,50"])("refuses %s", (input) => {
    expect(parsePrice(input)).toBeNull();
  });
});

describe("validateDish", () => {
  it("needs a name, a price and a category", () => {
    expect(validateDish({ name: "", price: "", category: "" })).toEqual({
      name: "Unesite naziv jela.",
      price: "Unesite cijenu.",
      category: "Odaberite kategoriju.",
    });
  });

  it("explains a price that isn't a number", () => {
    expect(validateDish({ name: "X", price: "zwölf", category: "c1" }).price).toBe(
      "Cijena mora biti broj, npr. 14,50.",
    );
  });

  it("accepts a complete dish", () => {
    expect(validateDish({ name: "X", price: "12,50", category: "c1" })).toEqual({});
  });
});

describe("validateImage", () => {
  it("accepts JPEG, PNG and WebP up to 10 MB", () => {
    expect(validateImage({ type: "image/webp", size: 10 * 1024 * 1024 })).toBeNull();
    expect(validateImage(null)).toBeNull();
  });

  it("refuses other types and bigger files", () => {
    expect(validateImage({ type: "image/gif", size: 10 })).toMatch(/JPEG, PNG ili WebP/);
    expect(validateImage({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toMatch(/10 MB/);
  });
});

describe("moveCategory", () => {
  const categories = [
    { _id: "b", order: 2 },
    { _id: "a", order: 1 },
    { _id: "c", order: 5 },
  ];

  it("swaps with the neighbour and renumbers from 1, returning only what changed", () => {
    expect(moveCategory(categories, "c", -1)).toEqual([
      { category: categories[2], order: 2 },
      { category: categories[0], order: 3 },
    ]);
  });

  it("returns nothing at the ends or for an unknown id", () => {
    expect(moveCategory(categories, "a", -1)).toEqual([]);
    expect(moveCategory(categories, "c", 1)).toEqual([]);
    expect(moveCategory(categories, "x", 1)).toEqual([]);
  });
});

describe("adminErrorMessage", () => {
  it("explains a lost connection", () => {
    expect(adminErrorMessage(new ApiError(null, 0))).toBe("Greška pri povezivanju sa serverom");
  });

  it("turns MongoDB's duplicate-key text into words", () => {
    const err = new ApiError("E11000 duplicate key error collection: categories index: slug_1", 400);
    expect(adminErrorMessage(err)).toBe("Kategorija s tim nazivom već postoji.");
  });

  it("shows the API's message, or the fallback", () => {
    expect(adminErrorMessage(new ApiError("Jelo nije pronađeno", 404))).toBe("Jelo nije pronađeno");
    expect(adminErrorMessage(new ApiError(null, 500), "Spremanje nije uspjelo")).toBe(
      "Spremanje nije uspjelo",
    );
  });
});
