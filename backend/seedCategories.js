const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/categoryModel");

dotenv.config();

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

async function seedCategories() {
  try {
    await mongoose.connect(process.env.DATABASE);

    console.log("MongoDB spojen");

    for (const category of categories) {
      const existingCategory = await Category.findOne({
        slug: category.slug,
      });

      if (!existingCategory) {
        await Category.create(category);
        console.log(`Dodana kategorija: ${category.name}`);
      } else {
        console.log(`Kategorija već postoji: ${category.name}`);
      }
    }

    console.log("Kategorije završene");

    process.exit(0);
  } catch (err) {
    console.log("ERROR:", err.message);
    process.exit(1);
  }
}

seedCategories();
