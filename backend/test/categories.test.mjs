import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  Category,
  Food,
  app,
  loginAsAdmin,
  mongoose,
  request,
  useMemoryDb,
} from "./helpers.mjs";

useMemoryDb();

let token;

beforeAll(async () => {
  token = await loginAsAdmin();
});

beforeEach(async () => {
  await Food.deleteMany({});
  await Category.deleteMany({});
});

const auth = () => ({ Authorization: `Bearer ${token}` });
const unknownId = () => new mongoose.Types.ObjectId().toString();

describe("POST /api/categories", () => {
  it("creates a category and answers 201", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set(auth())
      .send({ name: "  DRINKS  ", slug: "drinks", order: 8 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      status: "success",
      data: {
        category: {
          _id: expect.any(String),
          name: "DRINKS",
          slug: "drinks",
          order: 8,
          __v: 0,
        },
      },
    });
  });

  it("defaults order to 0", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set(auth())
      .send({ name: "DRINKS", slug: "drinks" });

    expect(res.status).toBe(201);
    expect(res.body.data.category.order).toBe(0);
  });

  it.each([
    ["name", { slug: "drinks" }, "Kategorija mora imati naziv"],
    ["slug", { name: "DRINKS" }, "Kategorija mora imati slug"],
  ])("answers 400 without a %s", async (_, body, message) => {
    const res = await request(app)
      .post("/api/categories")
      .set(auth())
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain(message);
  });

  it("answers 400 with MongoDB's duplicate-key error for a slug that exists", async () => {
    await Category.create({ name: "DRINKS", slug: "drinks", order: 8 });

    const res = await request(app)
      .post("/api/categories")
      .set(auth())
      .send({ name: "MORE DRINKS", slug: "drinks", order: 9 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("E11000 duplicate key");
    expect(await Category.countDocuments()).toBe(1);
  });
});

describe("PATCH /api/categories/:id", () => {
  it("updates a category and answers it", async () => {
    const category = await Category.create({
      name: "DRINKS",
      slug: "drinks",
      order: 8,
    });

    const res = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set(auth())
      .send({ name: "GETRÄNKE", order: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.category).toMatchObject({
      _id: category._id.toString(),
      name: "GETRÄNKE",
      slug: "drinks",
      order: 2,
    });
  });

  it("runs the validators", async () => {
    const category = await Category.create({ name: "DRINKS", slug: "drinks" });

    const res = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set(auth())
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Kategorija mora imati naziv");
  });

  it("answers 200 with a null category for an unknown id (current behaviour)", async () => {
    const res = await request(app)
      .patch(`/api/categories/${unknownId()}`)
      .set(auth())
      .send({ name: "X" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "success", data: { category: null } });
  });

  it("answers 400 for an id that isn't an ObjectId", async () => {
    const res = await request(app)
      .patch("/api/categories/not-an-id")
      .set(auth())
      .send({ name: "X" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Cast to ObjectId failed");
  });
});

describe("DELETE /api/categories/:id", () => {
  it("deletes an empty category and answers 204", async () => {
    const category = await Category.create({ name: "DRINKS", slug: "drinks" });

    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set(auth());

    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(await Category.findById(category._id)).toBeNull();
  });

  it("answers 400 and keeps a category that still has dishes", async () => {
    const category = await Category.create({ name: "DIPS", slug: "dips" });
    await Food.create([
      { name: "KETCHUP", price: 1, category: category._id },
      { name: "MAYO", price: 1, category: category._id },
    ]);

    const res = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set(auth());

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: "fail",
      message: "Kategoriju nije moguće obrisati jer sadrži 2 proizvoda.",
    });
    expect(await Category.findById(category._id)).not.toBeNull();
  });

  it("answers 404 for an unknown id", async () => {
    const res = await request(app)
      .delete(`/api/categories/${unknownId()}`)
      .set(auth());

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: "fail",
      message: "Kategorija nije pronađena",
    });
  });

  it("answers 400 for an id that isn't an ObjectId", async () => {
    const res = await request(app)
      .delete("/api/categories/not-an-id")
      .set(auth());

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Cast to ObjectId failed");
  });
});

describe("writes without a token", () => {
  it("answers 401 for POST, PATCH and DELETE and changes nothing", async () => {
    const category = await Category.create({ name: "KEEP", slug: "keep" });

    const responses = [
      await request(app)
        .post("/api/categories")
        .send({ name: "X", slug: "x" }),
      await request(app)
        .patch(`/api/categories/${category._id}`)
        .send({ name: "CHANGED" }),
      await request(app).delete(`/api/categories/${category._id}`),
    ];

    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: "fail",
        message: "Niste prijavljeni",
      });
    }

    const remaining = await Category.find();

    expect(remaining.map((c) => c.name)).toEqual(["KEEP"]);
  });
});
