import { API_URL } from "../config";

export function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "";

  return `${number.toFixed(2).replace(".", ",")} €`;
}

export function imageUrl(path) {
  if (!path) return "";

  return path.startsWith("/uploads/") ? `${API_URL}${path}` : path;
}

export function pluralize(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

export function pluralizeHr(count, one, few, many) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;

  if (lastDigit === 1 && lastTwo !== 11) return `${count} ${one}`;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} ${few}`;

  return `${count} ${many}`;
}
