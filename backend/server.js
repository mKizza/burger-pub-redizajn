const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const foodRouter = require("./routes/foodRoutes");
const authRouter = require("./routes/authRoutes");
const categoryRouter = require("./routes/categoryRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/food", foodRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);

app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Burger Pub API radi",
  });
});

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
