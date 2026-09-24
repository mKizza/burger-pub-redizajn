const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/adminModel");

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.DATABASE);

    console.log("BAZA:", mongoose.connection.name);

    const existingAdmin = await Admin.findOne({
      username: process.env.ADMIN_USERNAME,
    });

    if (existingAdmin) {
      console.log("Admin već postoji");
      process.exit(0);
    }

    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    });

    console.log("Admin uspješno kreiran");
    process.exit(0);
  } catch (err) {
    console.log("GREŠKA:", err.message);
    process.exit(1);
  }
}

createAdmin();
