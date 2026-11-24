const crypto = require("crypto");
const http = require("http");
const path = require("path");

const { installFakeImageKit, installFakeMail } = require("./fakes");
const { startMemoryMongo } = require("./memoryMongo");

const HOST = "127.0.0.1";
const PORT = Number(process.env.E2E_API_PORT) || 5661;
const MONGO_PORT = Number(process.env.E2E_MONGO_PORT) || 5662;
const ADMIN = { username: "e2e-admin", password: "e2e-password-123" };

// Vite proxy šalje Origin stranice pod testom; app.js ga ne zna i odgovara 500
const SITE_ORIGINS = ["http://localhost:5660", "http://127.0.0.1:5660"];

const quiet = { log: () => {} };

let mongo = null;
let server = null;
let mongoose = null;
let stopping = false;

async function stop(exitCode) {
  if (stopping) return;
  stopping = true;

  try {
    if (server) {
      server.close();
      server.closeAllConnections();
    }
    if (mongoose) await mongoose.disconnect();
    if (mongo) await mongo.stop();
  } catch (err) {
    console.error("E2E API: error while stopping:", err);
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

async function main() {
  // app.js poslužuje /uploads relativno na cwd, kao server.js iz backend/
  process.chdir(path.join(__dirname, ".."));

  mongo = await startMemoryMongo({ port: MONGO_PORT });

  process.env.DATABASE = mongo.getUri("burgerpub-e2e");
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.IMAGEKIT_PRIVATE_KEY = "private_e2e_placeholder";
  process.env.EMAIL_USER = "website@burgerpub.test";
  delete process.env.EMAIL_PASSWORD;

  const mail = installFakeMail();
  const images = installFakeImageKit({
    baseUrl: `http://${HOST}:${PORT}/__e2e/images`,
  });

  const express = require("express");
  mongoose = require("mongoose");
  const app = require("../app");
  const { seedCategories } = require("../seedCategories");
  const { seedFood } = require("../seedFood");
  const { createAdmin } = require("../createAdmin");

  await mongoose.connect(process.env.DATABASE);
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init()),
  );

  async function seed() {
    await seedCategories(quiet);
    await seedFood(quiet);
    await createAdmin({ ...ADMIN, ...quiet });
  }

  let resetQueue = Promise.resolve();

  function reset() {
    resetQueue = resetQueue
      .catch(() => {})
      .then(async () => {
        await mongoose.connection.dropDatabase();
        // dropDatabase briše i unique indekse; Mongoose ih sam ne vraća
        await Promise.all(
          Object.values(mongoose.models).map((model) => model.createIndexes()),
        );
        await seed();
        mail.clear();
        mail.setFail(false);
        images.clear();
      });

    return resetQueue;
  }

  await seed();

  const e2e = express.Router();

  e2e.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  e2e.get("/mails", (req, res) => {
    res.json({ mails: [...mail.mails] });
  });

  e2e.delete("/mails", (req, res) => {
    mail.clear();
    res.json({ ok: true });
  });

  e2e.post("/mail-fail", (req, res) => {
    mail.setFail(req.body?.fail === true);
    res.json({ ok: true, fail: mail.isFailing() });
  });

  e2e.post("/reset", async (req, res) => {
    await reset();
    res.json({ ok: true });
  });

  e2e.get("/images", (req, res) => {
    res.json({ images: images.list() });
  });

  e2e.get("/images/:fileId", (req, res) => {
    const image = images.get(req.params.fileId);

    if (!image || image.deleted) {
      return res.sendStatus(404);
    }

    res.type(image.mimeType).send(image.data);
  });

  app.use("/__e2e", e2e);

  server = http.createServer((req, res) => {
    if (SITE_ORIGINS.includes(req.headers.origin)) {
      delete req.headers.origin;
    }

    app(req, res);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, HOST, resolve);
  });

  console.log(`E2E MongoDB on ${mongo.getUri()}`);
  console.log(`E2E API ready on ${PORT}`);
}

main().catch((err) => {
  console.error("E2E API failed to start:", err);
  stop(1);
});
