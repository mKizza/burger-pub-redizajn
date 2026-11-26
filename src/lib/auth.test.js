import { describe, expect, it } from "vitest";
import { decodeTokenPayload, isTokenUsable } from "./auth";

function fakeToken(payload) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

const NOW = Date.parse("2026-11-24T12:00:00Z");

describe("decodeTokenPayload", () => {
  it("reads a JWT's payload, base64url and all", () => {
    expect(decodeTokenPayload(fakeToken({ id: "abc?>", exp: 1 }))).toEqual({ id: "abc?>", exp: 1 });
  });

  it("returns null for something that isn't a JWT", () => {
    expect(decodeTokenPayload("not-a-token")).toBeNull();
    expect(decodeTokenPayload("a.%%%.c")).toBeNull();
  });
});

describe("isTokenUsable", () => {
  it("accepts a token that hasn't expired", () => {
    expect(isTokenUsable(fakeToken({ id: "1", exp: NOW / 1000 + 60 }), NOW)).toBe(true);
  });

  it("refuses an expired token", () => {
    expect(isTokenUsable(fakeToken({ id: "1", exp: NOW / 1000 - 1 }), NOW)).toBe(false);
  });

  it("leaves a token without exp to the API", () => {
    expect(isTokenUsable(fakeToken({ id: "1" }), NOW)).toBe(true);
  });

  it("refuses nothing and garbage", () => {
    expect(isTokenUsable(null, NOW)).toBe(false);
    expect(isTokenUsable("", NOW)).toBe(false);
    expect(isTokenUsable("garbage", NOW)).toBe(false);
  });
});
