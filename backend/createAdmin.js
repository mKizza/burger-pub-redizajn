const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/adminModel");

async function createAdmin({ username, password, log = console.log }) {
  const existingAdmin = await Admin.findOne({ username });

  if (existingAdmin) {
    log("Admin već postoji");
    return existingAdmin;
  }

  const admin = await Admin.create({ username, password });

  log("Admin uspješno kreiran");
  return admin;
}

async function main() {
  try {
    await mongoose.connect(process.env.DATABASE);

    console.log("BAZA:", mongoose.connection.name);

    await createAdmin({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    });

    process.exit(0);
  } catch (err) {
    console.log("GREŠKA:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  dotenv.config();
  main();
}

module.exports = { createAdmin };
