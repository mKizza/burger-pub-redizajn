const express = require("express");

const foodController = require("../controllers/foodController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(foodController.getAllFood)
  .post(
    authController.protect,
    foodController.uploadFoodImage,
    foodController.createFood,
  );

router
  .route("/:id")
  .patch(
    authController.protect,
    foodController.uploadFoodImage,
    foodController.updateFood,
  )
  .delete(authController.protect, foodController.deleteFood);

module.exports = router;
