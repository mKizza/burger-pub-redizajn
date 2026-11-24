import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  Category,
  Food,
  IMAGE_BASE_URL,
  TINY_PNG,
  app,
  images,
  loginAsAdmin,
  mongoose,
  request,
  useMemoryDb,
} from "./helpers.mjs";

useMemoryDb();

let token;
let category;

beforeAll(async () => {
  token = await loginAsAdmin();
});

beforeEach(async () => {
  await Food.deleteMany({});
  await Category.deleteMany({});
  images.clear();

  category = await Category.create({
    name: "BEEF BURGER",
    slug: "beefBurger",
    order: 1,
  });
});

const auth = () => ({ Authorization: `Bearer ${token}` });
const unknownId = () => new mongoose.Types.ObjectId().toString();

describe("POST /api/food", () => {
  it("creates a dish from JSON and answers it with the category populated", async () => {
    const res = await request(app)
      .post("/api/food")
      .set(auth())
      .send({ name: "TEST BURGER", price: 9.5, category: category._id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.food).toEqual({
      _id: expect.any(String),
      name: "TEST BURGER",
      description: "",
      price: 9.5,
      image: "",
      imageFileId: "",
      category: {
        _id: category._id.toString(),
        name: "BEEF BURGER",
        slug: "beefBurger",
        order: 1,
        __v: 0,
      },
      order: 0,
      __v: 0,
    });
    expect(await Food.countDocuments()).toBe(1);
  });

  it("casts a multipart form's price and saves extra fields as given", async () => {
    const res = await request(app)
      .post("/api/food")
      .set(auth())
      .field("name", "FORM BURGER")
      .field("price", "12.5")
      .field("category", category._id.toString())
      .field("order", "3")
      .field("image", "/burgers-images/food-2.JPG");

    expect(res.status).toBe(201);
    expect(res.body.data.food).toMatchObject({
      name: "FORM BURGER",
      price: 12.5,
      order: 3,
      image: "/burgers-images/food-2.JPG",
    });
  });

  it.each([
    ["name", "Hrana mora imati naziv"],
    ["price", "Hrana mora imati cijenu"],
    ["category", "Hrana mora imati kategoriju"],
  ])("answers 400 without a %s", async (field, message) => {
    const body = { name: "X", price: 9, category: category._id };
    delete body[field];

    const res = await request(app).post("/api/food").set(auth()).send(body);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain(message);
    expect(await Food.countDocuments()).toBe(0);
  });

  it("answers 400 with a cast error for a price that isn't a number", async () => {
    const res = await request(app)
      .post("/api/food")
      .set(auth())
      .send({ name: "X", price: "abc", category: category._id });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Cast to Number failed");
  });

  it("uploads a photo to ImageKit and stores its url and file id", async () => {
    const res = await request(app)
      .post("/api/food")
      .set(auth())
      .field("name", "PHOTO BURGER")
      .field("price", "10")
      .field("category", category._id.toString())
      .attach("image", TINY_PNG, {
        filename: "tiny.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);

    const { image, imageFileId } = res.body.data.food;
    const stored = images.get(imageFileId);

    expect(image).toBe(`${IMAGE_BASE_URL}/${imageFileId}`);
    expect(stored).toMatchObject({
      folder: "/burger-pub/food",
      mimeType: "image/png",
      deleted: false,
    });
    expect(stored.fileName).toMatch(/^food-\d+-tiny\.png$/);
    expect(stored.data.equals(TINY_PNG)).toBe(true);
  });

  it("answers 500 with an HTML page for a file that isn't an image", async () => {
    const res = await request(app)
      .post("/api/food")
      .set(auth())
      .field("name", "X")
      .field("price", "1")
      .field("category", category._id.toString())
      .attach("image", Buffer.from("hello"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(500);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain("Možete uploadati samo slike");
    expect(images.list()).toEqual([]);
    expect(await Food.countDocuments()).toBe(0);
  });
});

describe("PATCH /api/food/:id", () => {
  it("updates a dish and answers the updated dish", async () => {
    const dish = await Food.create({
      name: "OLD",
      price: 9,
      category: category._id,
      order: 2,
    });

    const res = await request(app)
      .patch(`/api/food/${dish._id}`)
      .set(auth())
      .send({ name: "NEW", price: 11.5 });

    expect(res.status).toBe(200);
    expect(res.body.data.food).toMatchObject({
      _id: dish._id.toString(),
      name: "NEW",
      price: 11.5,
      order: 2,
      category: { slug: "beefBurger" },
    });

    const saved = await Food.findById(dish._id);

    expect(saved.name).toBe("NEW");
  });

  it("runs the validators", async () => {
    const dish = await Food.create({
      name: "X",
      price: 9,
      category: category._id,
    });

    const res = await request(app)
      .patch(`/api/food/${dish._id}`)
      .set(auth())
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Hrana mora imati naziv");
  });

  it("replaces the photo and deletes the old one from ImageKit after saving", async () => {
    const created = await request(app)
      .post("/api/food")
      .set(auth())
      .field("name", "PHOTO BURGER")
      .field("price", "10")
      .field("category", category._id.toString())
      .attach("image", TINY_PNG, {
        filename: "a.png",
        contentType: "image/png",
      });
    const oldFileId = created.body.data.food.imageFileId;

    const res = await request(app)
      .patch(`/api/food/${created.body.data.food._id}`)
      .set(auth())
      .attach("image", TINY_PNG, {
        filename: "b.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);

    const newFileId = res.body.data.food.imageFileId;

    expect(newFileId).not.toBe(oldFileId);
    expect(res.body.data.food.image).toBe(`${IMAGE_BASE_URL}/${newFileId}`);
    expect(images.get(oldFileId).deleted).toBe(true);
    expect(images.get(newFileId).deleted).toBe(false);
  });

  it("answers 404 for an unknown id", async () => {
    const res = await request(app)
      .patch(`/api/food/${unknownId()}`)
      .set(auth())
      .send({ price: 1 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: "fail",
      message: "Jelo nije pronađeno",
    });
  });

  it("answers 400 for an id that isn't an ObjectId", async () => {
    const res = await request(app)
      .patch("/api/food/not-an-id")
      .set(auth())
      .send({ price: 1 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Cast to ObjectId failed");
  });
});

describe("DELETE /api/food/:id", () => {
  it("deletes a dish and answers 204", async () => {
    const dish = await Food.create({
      name: "X",
      price: 9,
      category: category._id,
    });

    const res = await request(app).delete(`/api/food/${dish._id}`).set(auth());

    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(await Food.findById(dish._id)).toBeNull();
  });

  it("deletes the dish's ImageKit photo too", async () => {
    const created = await request(app)
      .post("/api/food")
      .set(auth())
      .field("name", "PHOTO BURGER")
      .field("price", "10")
      .field("category", category._id.toString())
      .attach("image", TINY_PNG, {
        filename: "a.png",
        contentType: "image/png",
      });
    const { _id, imageFileId } = created.body.data.food;

    const res = await request(app).delete(`/api/food/${_id}`).set(auth());

    expect(res.status).toBe(204);
    expect(images.get(imageFileId).deleted).toBe(true);
  });

  it("still deletes the dish when deleting its photo fails", async () => {
    const dish = await Food.create({
      name: "X",
      price: 9,
      category: category._id,
      imageFileId: "missing-file-id",
    });

    const res = await request(app).delete(`/api/food/${dish._id}`).set(auth());

    expect(res.status).toBe(204);
    expect(await Food.findById(dish._id)).toBeNull();
  });

  it("answers 404 for an unknown id", async () => {
    const res = await request(app)
      .delete(`/api/food/${unknownId()}`)
      .set(auth());

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: "fail",
      message: "Jelo nije pronađeno",
    });
  });

  it("answers 400 for an id that isn't an ObjectId", async () => {
    const res = await request(app).delete("/api/food/not-an-id").set(auth());

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Cast to ObjectId failed");
  });
});

describe("writes without a token", () => {
  it("answers 401 for POST, PATCH and DELETE and changes nothing", async () => {
    const dish = await Food.create({
      name: "KEEP",
      price: 9,
      category: category._id,
    });

    const responses = [
      await request(app)
        .post("/api/food")
        .send({ name: "X", price: 1, category: category._id }),
      await request(app)
        .patch(`/api/food/${dish._id}`)
        .send({ name: "CHANGED" }),
      await request(app).delete(`/api/food/${dish._id}`),
    ];

    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        status: "fail",
        message: "Niste prijavljeni",
      });
    }

    const remaining = await Food.find();

    expect(remaining.map((f) => f.name)).toEqual(["KEEP"]);
  });
});
