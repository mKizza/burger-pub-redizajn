const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.correctPassword = async function (
  candidatePassword,
  adminPassword,
) {
  return await bcrypt.compare(candidatePassword, adminPassword);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
