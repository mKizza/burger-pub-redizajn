import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, clearMenuCache, getMenu, peekMenu } from "./api";

function jsonResponse(body, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  clearMenuCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("apiFetch", () => {
  it("calls the API's origin and returns the JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "success", data: { ok: 1 } }));

    await expect(apiFetch("/api/test")).resolves.toEqual({ status: "success", data: { ok: 1 } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5000/api/test",
      expect.objectContaining({ method: "GET", headers: {} }),
    );
  });

  it("sends objects as JSON, with the admin's token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "success" }));

    await apiFetch("/api/categories", { method: "POST", body: { name: "X" }, token: "abc" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers).toEqual({ "Content-Type": "application/json", Authorization: "Bearer abc" });
    expect(init.body).toBe('{"name":"X"}');
  });

  it("sends FormData as it is, so the browser sets the multipart boundary", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "success" }));
    const form = new FormData();
    form.append("name", "X");

    await apiFetch("/api/food", { method: "POST", body: form });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("returns null for 204 No Content", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/api/food/1", { method: "DELETE" })).resolves.toBeNull();
  });

  it("throws an ApiError with the API's message and status", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "fail", message: "Das Datum liegt in der Vergangenheit." }, 400));

    const err = await apiFetch("/api/reservations", { method: "POST", body: {} }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.serverMessage).toBe("Das Datum liegt in der Vergangenheit.");
  });

  it("copes with an error page that isn't JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Not allowed by CORS</html>", { status: 500 }));

    const err = await apiFetch("/api/test").catch((e) => e);

    expect(err.status).toBe(500);
    expect(err.serverMessage).toBeNull();
  });

  it("reports a network failure as status 0", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const err = await apiFetch("/api/test").catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
  });

  it("lets an abort through unchanged", async () => {
    const abort = new DOMException("Aborted", "AbortError");
    fetchMock.mockRejectedValue(abort);

    await expect(apiFetch("/api/test")).rejects.toBe(abort);
  });
});

describe("getMenu", () => {
  const categories = [{ _id: "c1", name: "DIPS" }];
  const food = [{ _id: "f1", name: "BBQ SAUCE", category: categories[0] }];

  function answerMenu() {
    fetchMock.mockImplementation(async (url) =>
      url.endsWith("/api/food")
        ? jsonResponse({ status: "success", data: { food } })
        : jsonResponse({ status: "success", data: { categories } }),
    );
  }

  it("loads dishes and categories in parallel", async () => {
    answerMenu();

    await expect(getMenu()).resolves.toEqual({ food, categories });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reuses the answer for five minutes, then asks again", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    answerMenu();

    await getMenu();
    await getMenu();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    vi.setSystemTime(Date.now() + 5 * 60_000 + 1);
    await getMenu();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("hands out a loaded menu synchronously, so a page can render it at once", async () => {
    answerMenu();

    const pending = getMenu();
    expect(peekMenu()).toBeNull();

    await pending;
    expect(peekMenu()).toEqual({ food, categories });

    clearMenuCache();
    expect(peekMenu()).toBeNull();
  });

  it("doesn't keep a failure, so the next call retries", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "error", message: "boom" }, 500));
    await expect(getMenu()).rejects.toBeInstanceOf(ApiError);

    answerMenu();
    await expect(getMenu()).resolves.toEqual({ food, categories });
  });

  it("refuses an answer without the expected envelope", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: "success", data: {} }));

    await expect(getMenu()).rejects.toBeInstanceOf(ApiError);
  });
});
