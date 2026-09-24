const Category = require("../models/categoryModel");
const Food = require("../models/foodModel");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("order");

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "Kategorija nije pronađena",
      });
    }

    const foodCount = await Food.countDocuments({
      category: req.params.id,
    });

    if (foodCount > 0) {
      return res.status(400).json({
        status: "fail",
        message: `Kategoriju nije moguće obrisati jer sadrži ${foodCount} proizvoda.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
