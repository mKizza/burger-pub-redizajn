const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const Food = require("./models/foodModel");
const Category = require("./models/categoryModel");

async function seedFood({ log = console.log } = {}) {
  // menu.json se nalazi jedan folder iznad backend foldera
  const menuPath = path.join(__dirname, "../menu.json");

  const menuData = JSON.parse(fs.readFileSync(menuPath, "utf-8"));

  for (const [slug, section] of Object.entries(menuData)) {
    // Pronađi kategoriju po slugu
    const category = await Category.findOne({ slug });

    if (!category) {
      log(`Kategorija nije pronađena: ${slug}`);
      continue;
    }

    // Prođi kroz svaku stavku kategorije
    for (let i = 0; i < section.items.length; i++) {
      const item = section.items[i];

      // Provjera da ne napravimo duplikate ako script pokrenemo opet
      const existingFood = await Food.findOne({
        name: item.name,
        category: category._id,
      });

      if (existingFood) {
        log(`Već postoji: ${item.name}`);
        continue;
      }

      // "14,50 €" -> 14.50
      const price = Number(
        item.price.replace("€", "").replace(",", ".").trim(),
      );

      await Food.create({
        name: item.name,
        description: item.description || "",
        price,
        image: item.image || "",
        category: category._id,
        order: i + 1,
      });

      log(`Dodano: ${item.name}`);
    }
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.DATABASE);

    console.log("MongoDB spojen");

    await seedFood();

    console.log("Sva hrana uspješno prebačena u MongoDB");

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

module.exports = { seedFood };
