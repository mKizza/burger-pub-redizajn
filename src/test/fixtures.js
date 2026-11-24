export const categories = [
  { _id: "cat-beef", name: "BEEF BURGER", slug: "beefBurger", order: 1 },
  { _id: "cat-sides", name: "BEILAGEN", slug: "beilagen", order: 2 },
  { _id: "cat-dips", name: "DIPS", slug: "dips", order: 3 },
  { _id: "cat-empty", name: "SAISONAL", slug: "saisonal", order: 4 },
];

const [beef, sides, dips] = categories;

export const food = [
  {
    _id: "dish-classic",
    name: "CLASSIC BEEF BURGER",
    description: "100% Beef-Patty, Cheddar, Salat, Tomate",
    price: 14.5,
    image: "/burgers-images/food1-1.JPG",
    order: 1,
    category: beef,
  },
  {
    _id: "dish-bbq",
    name: "BBQ BEEF BURGER",
    description: "100% Beef-Patty, Röstzwiebeln und BBQ-Sauce",
    price: 15.5,
    image: "/burgers-images/food-4.JPG",
    order: 2,
    category: beef,
  },
  {
    _id: "dish-spicy",
    name: "SPICY BEEF BURGER",
    description: "Jalapeños und scharfe Chili-Sauce",
    price: 15.5,
    image: "",
    order: 3,
    category: beef,
  },
  {
    _id: "dish-fries",
    name: "SÜSSKARTOFFEL POMMES",
    description: "Knusprige Süßkartoffel-Pommes",
    price: 5.5,
    image: "",
    order: 1,
    category: sides,
  },
  {
    _id: "dish-bbq-sauce",
    name: "BBQ SAUCE",
    description: "",
    price: 1.5,
    image: "",
    order: 1,
    category: dips,
  },
];

export function menuRoutes(overrides = {}) {
  return {
    "GET /api/food": { json: { status: "success", results: food.length, data: { food } } },
    "GET /api/categories": {
      json: { status: "success", results: categories.length, data: { categories } },
    },
    ...overrides,
  };
}

function base64url(value) {
  return btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function fakeToken(expiresInSeconds = 3600) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url({ id: "admin-1", exp })}.signature`;
}
