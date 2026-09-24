const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Kategorija mora imati naziv"],
    trim: true,
  },

  slug: {
    type: String,
    required: [true, "Kategorija mora imati slug"],
    unique: true,
    trim: true,
  },

  order: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
