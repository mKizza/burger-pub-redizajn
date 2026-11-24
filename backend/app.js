const express = require("express");
const cors = require("cors");

const foodRouter = require("./routes/foodRoutes");
const authRouter = require("./routes/authRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://burgerpubmunchen.de",
  "https://www.burgerpubmunchen.de",
  "https://burger-pub-redizajn.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/food", foodRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/contact", contactRoutes);
app.use("/api/reservations", reservationRoutes);

app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Burger Pub API radi",
  });
});

module.exports = app;
