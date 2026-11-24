export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TRANSLITERATE = { ä: "ae", ö: "oe", ü: "ue", ß: "ss", đ: "dj", æ: "ae", ø: "o" };

export function slugify(name, existingSlugs = []) {
  const base =
    String(name)
      .toLowerCase()
      .replace(/[äöüßđæø]/g, (char) => TRANSLITERATE[char])
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "kategorija";

  const taken = new Set(existingSlugs);
  let slug = base;
  let suffix = 2;

  while (taken.has(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export function nextOrder(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
}

export function parsePrice(value) {
  const text = String(value).trim().replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

  return Number(text);
}

export function validateDish(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Unesite naziv jela.";

  if (String(values.price).trim() === "") {
    errors.price = "Unesite cijenu.";
  } else if (parsePrice(values.price) === null) {
    errors.price = "Cijena mora biti broj, npr. 14,50.";
  }

  if (!values.category) errors.category = "Odaberite kategoriju.";

  return errors;
}

export function validateImage(file) {
  if (!file) return null;
  if (!IMAGE_TYPES.includes(file.type)) return "Dozvoljene su samo slike JPEG, PNG ili WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "Slika je prevelika (najviše 10 MB).";

  return null;
}

export function moveCategory(categories, id, direction) {
  const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const index = sorted.findIndex((category) => category._id === id);
  const target = index + direction;

  if (index < 0 || target < 0 || target >= sorted.length) return [];

  [sorted[index], sorted[target]] = [sorted[target], sorted[index]];

  return sorted
    .map((category, position) => ({ category, order: position + 1 }))
    .filter(({ category, order }) => category.order !== order);
}

export function adminErrorMessage(err, fallback = "Došlo je do greške") {
  if (!err) return fallback;
  if (err.status === 0) return "Greška pri povezivanju sa serverom";

  const message = err.serverMessage || "";

  if (message.includes("E11000")) return "Kategorija s tim nazivom već postoji.";

  return message || fallback;
}
