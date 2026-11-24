import { beforeAll, describe, expect, it } from "vitest";
import {
  ADMIN,
  Admin,
  app,
  createAdmin,
  jwt,
  mongoose,
  request,
  useMemoryDb,
} from "./helpers.mjs";

useMemoryDb();

let admin;

beforeAll(async () => {
  admin = await createAdmin({ ...ADMIN, log: () => {} });
});

describe("POST /api/auth/login", () => {
  it.each([
    ["the username", { password: ADMIN.password }],
    ["the password", { username: ADMIN.username }],
    ["both", {}],
  ])("answers 400 without %s", async (_, body) => {
    const res = await request(app).post("/api/auth/login").send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: "fail",
      message: "Unesite korisničko ime i lozinku",
    });
  });

  it("answers 500 with the raw error for a request without a JSON body (current behaviour)", async () => {
    const res = await request(app).post("/api/auth/login");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: "error",
      message:
        "Cannot destructure property 'username' of 'req.body' as it is undefined.",
    });
  });

  it("answers 401 for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: ADMIN.username, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: "fail",
      message: "Pogrešno korisničko ime ili lozinka",
    });
  });

  it("answers the same 401 for an unknown username", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "nobody", password: ADMIN.password });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Pogrešno korisničko ime ili lozinka");
  });

  it("answers 200 and a JWT carrying the admin's id for the right password", async () => {
    const res = await request(app).post("/api/auth/login").send(ADMIN);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "success", token: expect.any(String) });

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);

    expect(payload.id).toBe(admin._id.toString());
    expect(payload.exp - payload.iat).toBe(60 * 60);
  });

  it("stores the password hashed", async () => {
    const stored = await Admin.findById(admin._id).select("+password");

    expect(stored.password).not.toBe(ADMIN.password);
    expect(stored.password).toMatch(/^\$2[aby]\$12\$/);
  });
});

describe("protect", () => {
  const protectedRequest = () =>
    request(app).post("/api/categories").send({ name: "X", slug: "x" });

  it("answers 401 without an Authorization header", async () => {
    const res = await protectedRequest();

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ status: "fail", message: "Niste prijavljeni" });
  });

  it.each(["Bearer", "Bearerxyz", "Token abc"])(
    "answers 401 Niste prijavljeni for the header %j",
    async (header) => {
      const res = await protectedRequest().set("Authorization", header);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Niste prijavljeni");
    },
  );

  it("answers 401 for a garbage token", async () => {
    const res = await protectedRequest().set(
      "Authorization",
      "Bearer not-a-jwt",
    );

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: "fail",
      message: "Nevažeći ili istekli token",
    });
  });

  it("answers 401 for a token signed with another secret", async () => {
    const token = jwt.sign({ id: admin._id }, "another-secret", {
      expiresIn: "1h",
    });

    const res = await protectedRequest().set(
      "Authorization",
      `Bearer ${token}`,
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Nevažeći ili istekli token");
  });

  it("answers 401 for an expired token", async () => {
    const token = jwt.sign(
      { id: admin._id, exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET,
    );

    const res = await protectedRequest().set(
      "Authorization",
      `Bearer ${token}`,
    );

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: "fail",
      message: "Nevažeći ili istekli token",
    });
  });

  it("answers 401 when the token's admin no longer exists", async () => {
    const token = jwt.sign(
      { id: new mongoose.Types.ObjectId() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const res = await protectedRequest().set(
      "Authorization",
      `Bearer ${token}`,
    );

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      status: "fail",
      message: "Admin više ne postoji",
    });
  });

  it("lets a valid token through", async () => {
    const login = await request(app).post("/api/auth/login").send(ADMIN);

    const res = await protectedRequest().set(
      "Authorization",
      `Bearer ${login.body.token}`,
    );

    expect(res.status).toBe(201);
  });
});
