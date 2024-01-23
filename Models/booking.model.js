const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
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
    houseId: {
      type: String,
    },
    userInfo: {
      name: {
        type: String,
      },
      emailId: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema, "bookingList");

module.exports = Booking;
