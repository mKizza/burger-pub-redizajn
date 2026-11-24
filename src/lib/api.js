import { API_URL } from "../config";

export class ApiError extends Error {
  constructor(message, status) {
    super(message || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = message || null;
  }
}

export async function apiFetch(path, { method = "GET", body, token, signal } = {}) {
  const headers = {};
  let payload = body;

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;

  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: payload,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(null, 0);
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message, res.status);
  }

  return data;
}

const MENU_CACHE_MS = 5 * 60_000;
let menuCache = null;

export function clearMenuCache() {
  menuCache = null;
}

async function loadMenu() {
  const [foodData, categoriesData] = await Promise.all([
    apiFetch("/api/food"),
    apiFetch("/api/categories"),
  ]);

  const food = foodData?.data?.food;
  const categories = categoriesData?.data?.categories;

  if (!Array.isArray(food) || !Array.isArray(categories)) {
    throw new ApiError("Unexpected response", 500);
  }

  return { food, categories };
}

function isFresh(cache) {
  return Boolean(cache) && Date.now() - cache.time < MENU_CACHE_MS;
}

export function getMenu() {
  if (!isFresh(menuCache)) {
    const entry = { time: Date.now(), data: null };
    entry.promise = loadMenu().then(
      (data) => {
        entry.data = data;
        return data;
      },
      (err) => {
        if (menuCache === entry) menuCache = null;
        throw err;
      },
    );
    menuCache = entry;
  }

  return menuCache.promise;
}

export function peekMenu() {
  return isFresh(menuCache) ? menuCache.data : null;
}
