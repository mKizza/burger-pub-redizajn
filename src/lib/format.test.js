import { describe, expect, it } from "vitest";
import { formatPrice, imageUrl, pluralize, pluralizeHr } from "./format";

describe("formatPrice", () => {
  it("writes euros with a decimal comma and two decimals", () => {
    expect(formatPrice(14.5)).toBe("14,50 €");
    expect(formatPrice(1.5)).toBe("1,50 €");
    expect(formatPrice(18)).toBe("18,00 €");
  });

  it("accepts numeric strings, as the API's prices may be", () => {
    expect(formatPrice("9.9")).toBe("9,90 €");
  });

  it("rounds to cents", () => {
    expect(formatPrice(2.005 + 0.001)).toBe("2,01 €");
  });

  it("returns an empty string for something that isn't a number", () => {
    expect(formatPrice("abc")).toBe("");
    expect(formatPrice(undefined)).toBe("");
  });
});

describe("imageUrl", () => {
  it("prefixes old /uploads/ photos with the API's origin", () => {
    expect(imageUrl("/uploads/food-1.jpg")).toBe("http://localhost:5000/uploads/food-1.jpg");
  });

  it("leaves ImageKit URLs and public/ paths alone", () => {
    expect(imageUrl("https://ik.imagekit.io/x/food.jpg")).toBe("https://ik.imagekit.io/x/food.jpg");
    expect(imageUrl("/burgers-images/food-2.JPG")).toBe("/burgers-images/food-2.JPG");
  });

  it("returns an empty string for a dish without a photo", () => {
    expect(imageUrl("")).toBe("");
    expect(imageUrl(undefined)).toBe("");
  });
});

describe("pluralize", () => {
  it("picks the singular only for one", () => {
    expect(pluralize(1, "Person", "Personen")).toBe("1 Person");
    expect(pluralize(0, "Person", "Personen")).toBe("0 Personen");
    expect(pluralize(4, "Person", "Personen")).toBe("4 Personen");
  });
});

describe("pluralizeHr", () => {
  const forms = ["kategorija", "kategorije", "kategorija"];

  it.each([
    [1, "1 kategorija"],
    [2, "2 kategorije"],
    [4, "4 kategorije"],
    [5, "5 kategorija"],
    [11, "11 kategorija"],
    [12, "12 kategorija"],
    [21, "21 kategorija"],
    [22, "22 kategorije"],
    [111, "111 kategorija"],
  ])("%i → %s", (count, expected) => {
    expect(pluralizeHr(count, ...forms)).toBe(expected);
  });
});
