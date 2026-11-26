export function buildMenu(categories = [], food = []) {
  return categories
    .map((category) => ({
      id: category._id,
      slug: category.slug,
      title: category.name,
      items: food.filter((item) => item.category?._id === category._id),
    }))
    .filter((section) => section.items.length > 0);
}

export function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .trim();
}

export function filterMenu(sections, query) {
  const needle = normalizeText(query);

  if (!needle) return sections;

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        normalizeText(`${item.name} ${item.description ?? ""}`).includes(needle),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function countItems(sections) {
  return sections.reduce((sum, section) => sum + section.items.length, 0);
}

export function pickFavorites(categories = [], food = [], limit = 8) {
  const categoryOrder = new Map(
    categories.map((category, index) => [category._id, index]),
  );

  return food
    .filter((item) => item.image)
    .sort((a, b) => {
      const byCategory =
        (categoryOrder.get(a.category?._id) ?? Infinity) -
        (categoryOrder.get(b.category?._id) ?? Infinity);

      return byCategory || (a.order ?? 0) - (b.order ?? 0);
    })
    .slice(0, limit);
}

export function dishAnchor(item) {
  return `gericht-${item._id}`;
}
