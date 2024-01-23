const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    emailId: {
      type: String,
      default: "",
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
