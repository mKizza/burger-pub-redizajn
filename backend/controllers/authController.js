const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Unesite korisničko ime i lozinku",
      });
    }

    const admin = await Admin.findOne({ username }).select("+password");
    console.log("USERNAME IZ FORME:", username);
    console.log("ADMIN PRONAĐEN:", admin);

    if (!admin || !(await admin.correctPassword(password, admin.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Pogrešno korisničko ime ili lozinka",
      });
    }

    const token = signToken(admin._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Niste prijavljeni",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentAdmin = await Admin.findById(decoded.id);

    if (!currentAdmin) {
      return res.status(401).json({
        status: "fail",
        message: "Admin više ne postoji",
      });
    }

    req.admin = currentAdmin;

    next();
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "Nevažeći ili istekli token",
    });
  }
};
