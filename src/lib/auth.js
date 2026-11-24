const TOKEN_KEY = "token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // privatni način bez localStoragea: prijava vrijedi samo do osvježavanja
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // vidi setToken
  }
}

export function decodeTokenPayload(token) {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Samo za UX: potpis provjerava API.
export function isTokenUsable(token, now = Date.now()) {
  if (!token) return false;

  const payload = decodeTokenPayload(token);

  if (!payload) return false;
  if (typeof payload.exp !== "number") return true;

  return payload.exp * 1000 > now;
}
