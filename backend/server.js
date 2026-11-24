const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// dotenv prije app.js: foodController čita IMAGEKIT_PRIVATE_KEY pri učitavanju
const app = require("./app");

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("MongoDB spojen");
  })
  .catch((err) => {
    console.log("Greška pri spajanju na MongoDB:");
    console.log(err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});
