const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Hrana mora imati naziv"],
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  price: {
    type: Number,
    required: [true, "Hrana mora imati cijenu"],
  },

  image: {
    type: String,
    default: "",
  },

  imageFileId: {
    type: String,
    default: "",
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Hrana mora imati kategoriju"],
  },

  order: {
    type: Number,
    default: 0,
  },
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
