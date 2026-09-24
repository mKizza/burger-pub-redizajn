const Food = require("../models/foodModel");
const multer = require("multer");
const ImageKit = require("@imagekit/nodejs");

// IMAGEKIT
const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

// GET ALL FOOD
exports.getAllFood = async (req, res) => {
  try {
    const food = await Food.find().populate("category").sort("order");

    res.status(200).json({
      status: "success",
      results: food.length,
      data: { food },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// MULTER - sliku držimo samo privremeno u memoriji
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Možete uploadati samo slike"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadFoodImage = upload.single("image");

// UPLOAD NA IMAGEKIT
async function uploadToImageKit(file) {
  const base64File = file.buffer.toString("base64");

  const result = await imagekit.files.upload({
    file: `data:${file.mimetype};base64,${base64File}`,
    fileName: `food-${Date.now()}-${file.originalname}`,
    folder: "/burger-pub/food",
  });

  return result;
}

// CREATE FOOD
exports.createFood = async (req, res) => {
  try {
    if (req.file) {
      const uploadedImage = await uploadToImageKit(req.file);

      console.log("IMAGEKIT UPLOAD:", uploadedImage);

      req.body.image = uploadedImage.url;
      req.body.imageFileId = uploadedImage.fileId;
    }

    const newFood = await Food.create(req.body);

    await newFood.populate("category");

    res.status(201).json({
      status: "success",
      data: {
        food: newFood,
      },
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);

    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// UPDATE FOOD
exports.updateFood = async (req, res) => {
  try {
    const oldFood = await Food.findById(req.params.id);

    if (!oldFood) {
      return res.status(404).json({
        status: "fail",
        message: "Jelo nije pronađeno",
      });
    }

    let newUploadedImage = null;

    if (req.file) {
      newUploadedImage = await uploadToImageKit(req.file);

      req.body.image = newUploadedImage.url;
      req.body.imageFileId = newUploadedImage.fileId;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }).populate("category");

    // Nova slika je uspješno spremljena u MongoDB.
    // Tek sada brišemo staru s ImageKita.
    if (newUploadedImage && oldFood.imageFileId) {
      try {
        await imagekit.files.delete(oldFood.imageFileId);
      } catch (imageError) {
        console.error("Greška pri brisanju stare ImageKit slike:", imageError);
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        food,
      },
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);

    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// DELETE FOOD
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        status: "fail",
        message: "Jelo nije pronađeno",
      });
    }

    if (food.imageFileId) {
      try {
        await imagekit.files.delete(food.imageFileId);
      } catch (imageError) {
        console.error("Greška pri brisanju ImageKit slike:", imageError);
      }
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (err) {
    console.error("DELETE ERROR:", err);

    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
