import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Admin,
  Category,
  Food,
  createAdmin,
  seedCategories,
  seedCategoryList,
  seedFood,
  useMemoryDb,
} from "./helpers.mjs";

useMemoryDb();

beforeEach(async () => {
  await Food.deleteMany({});
  await Category.deleteMany({});
  await Admin.deleteMany({});
});

const quiet = { log: () => {} };

describe("seedCategories", () => {
  it("creates the 7 categories in order and logs each", async () => {
    const log = vi.fn();

    await seedCategories({ log });

    const categories = await Category.find().sort("order");

    expect(categories.map((c) => [c.order, c.slug])).toEqual([
      [1, "beefBurger"],
      [2, "chickenVeggieBurger"],
      [3, "hauptgerichte"],
      [4, "burgerPlatte"],
      [5, "salate"],
      [6, "beilagen"],
      [7, "dips"],
    ]);
    expect(seedCategoryList).toHaveLength(7);
    expect(log).toHaveBeenCalledWith("Dodana kategorija: BEEF BURGER");
  });

  it("skips existing slugs without updating them", async () => {
    await Category.create({ name: "RENAMED", slug: "beefBurger", order: 9 });
    const log = vi.fn();

    await seedCategories({ log });
    const beef = await Category.findOne({ slug: "beefBurger" });

    expect(await Category.countDocuments()).toBe(7);
    expect(beef.name).toBe("RENAMED");
    expect(log).toHaveBeenCalledWith("Kategorija već postoji: BEEF BURGER");
  });
});

describe("seedFood", () => {
  it("creates the 44 dishes from menu.json with parsed prices and per-category order", async () => {
    await seedCategories(quiet);
    await seedFood(quiet);

    expect(await Food.countDocuments()).toBe(44);

    const beef = await Category.findOne({ slug: "beefBurger" });
    const classic = await Food.findOne({ name: "CLASSIC BEEF BURGER" });

    expect(classic.price).toBe(14.5);
    expect(classic.order).toBe(1);
    expect(classic.image).toBe("/burgers-images/food1-1.JPG");
    expect(classic.imageFileId).toBe("");
    expect(classic.category.toString()).toBe(beef._id.toString());
    expect(await Food.countDocuments({ category: beef._id })).toBe(12);

    const dips = await Category.findOne({ slug: "dips" });
    const dipFood = await Food.find({ category: dips._id }).sort("order");

    expect(dipFood).toHaveLength(6);
    expect(dipFood.map((f) => f.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(dipFood.every((f) => f.description === "")).toBe(true);
  });

  it("adds nothing when run again", async () => {
    await seedCategories(quiet);
    await seedFood(quiet);
    const log = vi.fn();

    await seedFood({ log });

    expect(await Food.countDocuments()).toBe(44);
    expect(log).toHaveBeenCalledWith("Već postoji: CLASSIC BEEF BURGER");
  });

  it("skips a section whose category doesn't exist", async () => {
    const log = vi.fn();

    await seedFood({ log });

    expect(await Food.countDocuments()).toBe(0);
    expect(log).toHaveBeenCalledWith("Kategorija nije pronađena: beefBurger");
  });
});

describe("createAdmin", () => {
  it("creates an admin with a hashed password", async () => {
    const log = vi.fn();

    const admin = await createAdmin({
      username: "chef",
      password: "secret-password",
      log,
    });

    const stored = await Admin.findById(admin._id).select("+password");
    const matches = await stored.correctPassword(
      "secret-password",
      stored.password,
    );

    expect(stored.username).toBe("chef");
    expect(stored.password).not.toBe("secret-password");
    expect(matches).toBe(true);
    expect(log).toHaveBeenCalledWith("Admin uspješno kreiran");
  });

  it("leaves an existing admin's password as it was", async () => {
    const first = await createAdmin({
      username: "chef",
      password: "first-password",
      ...quiet,
    });
    const log = vi.fn();

    await createAdmin({ username: "chef", password: "second-password", log });

    const stored = await Admin.findById(first._id).select("+password");
    const matches = await stored.correctPassword(
      "first-password",
      stored.password,
    );

    expect(await Admin.countDocuments()).toBe(1);
    expect(matches).toBe(true);
    expect(log).toHaveBeenCalledWith("Admin već postoji");
  });
});
