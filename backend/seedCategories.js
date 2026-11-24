const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/categoryModel");

const categories = [
  {
    name: "BEEF BURGER",
    slug: "beefBurger",
    order: 1,
  },
  {
    name: "CHICKEN & VEGGIE BURGERS",
    slug: "chickenVeggieBurger",
    order: 2,
  },
  {
    name: "HAUPTGERICHTE & FINGER FOOD",
    slug: "hauptgerichte",
    order: 3,
  },
  {
    name: "BURGER PUR MIT PLATTE",
    slug: "burgerPlatte",
    order: 4,
  },
  {
    name: "SALATE",
    slug: "salate",
    order: 5,
  },
  {
    name: "BEILAGEN",
    slug: "beilagen",
    order: 6,
  },
  {
    name: "DIPS",
    slug: "dips",
    order: 7,
  },
];

async function seedCategories({ log = console.log } = {}) {
  for (const category of categories) {
    const existingCategory = await Category.findOne({
      slug: category.slug,
    });

    if (!existingCategory) {
      await Category.create(category);
      log(`Dodana kategorija: ${category.name}`);
    } else {
      log(`Kategorija već postoji: ${category.name}`);
    }
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.DATABASE);

    console.log("MongoDB spojen");

    await seedCategories();

    console.log("Kategorije završene");

    process.exit(0);
  } catch (err) {
    console.log("ERROR:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  dotenv.config();
  main();
}

module.exports = { categories, seedCategories };
