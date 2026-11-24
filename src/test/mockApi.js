import { vi } from "vitest";

function matches(pattern, method, pathname) {
  const [patternMethod, patternPath] = pattern.split(" ");

  if (patternMethod !== method) return null;

  const expected = patternPath.split("/");
  const actual = pathname.split("/");

  if (expected.length !== actual.length) return null;

  const params = {};

  for (let i = 0; i < expected.length; i += 1) {
    if (expected[i].startsWith(":")) params[expected[i].slice(1)] = actual[i];
    else if (expected[i] !== actual[i]) return null;
  }

  return params;
}

function parseBody(body) {
  if (body instanceof FormData) return Object.fromEntries(body.entries());
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
}

// Odgovori: { json, status }, funkcija koja ih vraća, ili Error za mrežnu grešku.
export function mockApi(routes) {
  const realFetch = window.fetch.bind(window);
  const calls = [];

  const spy = vi.spyOn(window, "fetch").mockImplementation(async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, window.location.href);

    if (!url.pathname.startsWith("/api/")) return realFetch(input, init);

    const method = (init.method || "GET").toUpperCase();
    const call = {
      method,
      path: url.pathname,
      headers: init.headers ?? {},
      body: parseBody(init.body),
    };
    calls.push(call);

    let params = null;
    const pattern = Object.keys(routes).find((key) => (params = matches(key, method, url.pathname)));

    if (!pattern) {
      return new Response(JSON.stringify({ status: "fail", message: `No mock for ${method} ${url.pathname}` }), {
        status: 404,
      });
    }

    const handler = routes[pattern];
    const result = typeof handler === "function" ? await handler({ ...call, params }) : handler;

    if (result instanceof Error) throw result;

    const { status = 200, json } = result;

    return new Response(status === 204 ? null : JSON.stringify(json ?? { status: "success" }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });

  return {
    calls,
    spy,
    callsTo: (method, path) => calls.filter((call) => call.method === method && call.path === path),
  };
}

export function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
