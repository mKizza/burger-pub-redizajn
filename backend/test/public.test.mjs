import { beforeEach, describe, expect, it } from "vitest";
import {
  Category,
  Food,
  app,
  request,
  useMemoryDb,
} from "./helpers.mjs";

useMemoryDb();

beforeEach(async () => {
  await Food.deleteMany({});
  await Category.deleteMany({});
});

describe("GET /api/test", () => {
  it("answers without touching the database", async () => {
    const res = await request(app).get("/api/test");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "Burger Pub API radi",
    });
  });
});

describe("GET /api/categories", () => {
  it("lists every category sorted by order", async () => {
    await Category.create([
      { name: "SALATE", slug: "salate", order: 5 },
      { name: "BEEF BURGER", slug: "beefBurger", order: 1 },
      { name: "DIPS", slug: "dips", order: 7 },
    ]);

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.results).toBe(3);
    expect(res.body.data.categories.map((c) => c.slug)).toEqual([
      "beefBurger",
      "salate",
      "dips",
    ]);
    expect(res.body.data.categories[0]).toEqual({
      _id: expect.any(String),
      name: "BEEF BURGER",
      slug: "beefBurger",
      order: 1,
      __v: 0,
    });
  });

  it("answers an empty list when there are none", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      results: 0,
      data: { categories: [] },
    });
  });
});

describe("GET /api/food", () => {
  it("lists every dish sorted by order across categories, with the category populated", async () => {
    const [beef, dips] = await Category.create([
      { name: "BEEF BURGER", slug: "beefBurger", order: 1 },
      { name: "DIPS", slug: "dips", order: 7 },
    ]);

    await Food.create([
      { name: "CHEESE BURGER", price: 15, category: beef._id, order: 2 },
      { name: "KETCHUP", price: 1, category: dips._id, order: 1 },
      {
        name: "CLASSIC BEEF BURGER",
        description: "100% Beef-Patty",
        price: 14.5,
        image: "/burgers-images/food1-1.JPG",
        category: beef._id,
        order: 1,
      },
      { name: "NEW DISH", price: 9, category: beef._id },
    ]);

    const res = await request(app).get("/api/food");

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(4);

    const food = res.body.data.food;

    expect(food.map((f) => f.order)).toEqual([0, 1, 1, 2]);
    expect(food[0].name).toBe("NEW DISH");
    expect(food.slice(1, 3).map((f) => f.name).sort()).toEqual([
      "CLASSIC BEEF BURGER",
      "KETCHUP",
    ]);

    const classic = food.find((f) => f.name === "CLASSIC BEEF BURGER");

    expect(classic).toEqual({
      _id: expect.any(String),
      name: "CLASSIC BEEF BURGER",
      description: "100% Beef-Patty",
      price: 14.5,
      image: "/burgers-images/food1-1.JPG",
      imageFileId: "",
      category: {
        _id: beef._id.toString(),
        name: "BEEF BURGER",
        slug: "beefBurger",
        order: 1,
        __v: 0,
      },
      order: 1,
      __v: 0,
    });

    const newDish = food.find((f) => f.name === "NEW DISH");

    expect(newDish.description).toBe("");
    expect(newDish.image).toBe("");
  });
});

describe("static files and unknown paths", () => {
  it("serves backend/uploads/ under /uploads", async () => {
    const res = await request(app).get(
      "/uploads/food-1790153546561-325379612.jpg",
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
  });

  it("answers 404 with Express's HTML page for a missing upload", async () => {
    const res = await request(app).get("/uploads/nope.jpg");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
  });

  it("answers 404 with Express's HTML page for an unknown path", async () => {
    const res = await request(app).get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain("Cannot GET /api/nope");
  });

  it("answers 400 with an HTML page for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/contact")
      .set("Content-Type", "application/json")
      .send('{"name": ');

    expect(res.status).toBe(400);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
  });
});

describe("CORS", () => {
  it.each([
    "http://localhost:5173",
    "https://burgerpubmunchen.de",
    "https://www.burgerpubmunchen.de",
    "https://burger-pub-redizajn.vercel.app",
  ])("allows %s", async (origin) => {
    const res = await request(app).get("/api/test").set("Origin", origin);

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(origin);
  });

  it("answers a preflight from an allowed origin", async () => {
    const res = await request(app)
      .options("/api/reservations")
      .set("Origin", "https://burgerpubmunchen.de")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://burgerpubmunchen.de",
    );
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });

  it("lets requests without an Origin through", async () => {
    const res = await request(app).get("/api/test");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it.each(["https://evil.example", "http://localhost:3000"])(
    "refuses %s with a 500 HTML page (current behaviour)",
    async (origin) => {
      const res = await request(app).get("/api/test").set("Origin", origin);

      expect(res.status).toBe(500);
      expect(res.headers["content-type"]).toMatch(/text\/html/);
      expect(res.text).toContain("Not allowed by CORS");
      expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    },
  );
});
