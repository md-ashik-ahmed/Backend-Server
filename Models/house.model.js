const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    bedrooms: {
      type: String,
    },
    bathrooms: {
      type: String,
    },
    roomSize: {
      type: String,
    },
    houseImage: {
      type: String,
    },
    availabilityDate: {
      type: String,
    },
    rentPerMonth: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    description: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Houses = mongoose.model("House", houseSchema, "housesList");

module.exports = Houses;
