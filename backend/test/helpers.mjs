import { createRequire } from "node:module";
import { afterAll, beforeAll } from "vitest";

const require = createRequire(import.meta.url);

process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.IMAGEKIT_PRIVATE_KEY = "private_test_placeholder";
process.env.EMAIL_USER = "website@burgerpub.test";
delete process.env.EMAIL_PASSWORD;

const { installFakeMail, installFakeImageKit } = require("./fakes.js");
const { startMemoryMongo } = require("./memoryMongo.js");

export const IMAGE_BASE_URL = "https://ik.imagekit.test/burger-pub";

export const mail = installFakeMail();
export const images = installFakeImageKit({ baseUrl: IMAGE_BASE_URL });

export const app = require("../app.js");
export const request = require("supertest");
export const mongoose = require("mongoose");
export const jwt = require("jsonwebtoken");

export const Admin = require("../models/adminModel.js");
export const Category = require("../models/categoryModel.js");
export const Food = require("../models/foodModel.js");

export const { categories: seedCategoryList, seedCategories } = require(
  "../seedCategories.js",
);
export const { seedFood } = require("../seedFood.js");
export const { createAdmin } = require("../createAdmin.js");

export const ADMIN = { username: "test-admin", password: "test-password-123" };

export function useMemoryDb() {
  let mongo;

  beforeAll(async () => {
    mongo = await startMemoryMongo();
    await mongoose.connect(mongo.getUri("burgerpub-test"));
    await Promise.all(
      Object.values(mongoose.models).map((model) => model.init()),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });
}

export async function loginAsAdmin() {
  await createAdmin({ ...ADMIN, log: () => {} });

  const res = await request(app).post("/api/auth/login").send(ADMIN);

  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return res.body.token;
}

export const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
