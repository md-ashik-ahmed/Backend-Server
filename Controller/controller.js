require("dotenv").config();
const User = require("../Models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Houses = require("../Models/house.model");
const Booking = require("../Models/booking.model");
const saltRounds = 1;

exports.registerNewUser = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload.name) {
      throw new Error("Please provide user name");
    }
    if (!payload.emailId) {
      throw new Error("Please provide email id");
    }
    if (!payload.phoneNumber) {
      throw new Error("Please provide phone number");
    }

    const passwordHash = await bcrypt.hash(payload.password, saltRounds);

    const userObj = {
      name: payload.name,
      role: payload.role,
      phoneNumber: payload.phoneNumber,
      emailId: payload.emailId,
      password: passwordHash,
    };

    const user = await User(userObj).save();
    const findCriteria = {
      emailId: payload.emailId,
    };
    const userDetails = await User.find(findCriteria);

    const accessToken = jwt.sign(
      {
        _id: userDetails[0]._id,
        role: userDetails[0].role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60m" }
    );
    const refreshToken = jwt.sign(
      { _id: userDetails[0]._id, role: userDetails[0].role },
      process.env.REFRESH_TOKEN_SECRET
    );

    const updatedUser = await User.findOneAndUpdate(
      findCriteria,
      { accessToken: accessToken, refreshToken: refreshToken },
      { new: true }
    );

    let response = {
      info: "Welcome to House Hunter",
      success: 1,
      status: 200,
      accessToken: accessToken,
      refreshToken: refreshToken,
      user_details: updatedUser,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    let response = {
      info: "Failed to create user",
      success: 0,
      status: 500,
    };
    res.status(500).json({ response });
  }
};

exports.logIn = async (req, res) => {
  const payload = req.body;
  const email = payload.email;
  const password = payload.password;

  const findCriteria = {
    emailId: email,
  };
  const userDetails = await User.find(findCriteria).limit(1).exec();

  try {
    let isMatched = await bcrypt.compare(password, userDetails[0].password);
    if (isMatched) {
      const accessToken = jwt.sign(
        {
          _id: userDetails[0]._id,
          role: userDetails[0].role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "60m" }
      );
      const refreshToken = jwt.sign(
        { _id: userDetails[0]._id, role: userDetails[0].role },
        process.env.REFRESH_TOKEN_SECRET
      );

      const updatedUser = await User.findOneAndUpdate(
        findCriteria,
        { accessToken: accessToken, refreshToken: refreshToken },
        { new: true }
      );
      let response = {
        info: "Successfully logged in",
        success: 1,
        status: 200,
        accessToken: accessToken,
        refreshToken: refreshToken,
        user_details: updatedUser,
      };
      res.send(response);
    } else if (!isMatched) {
      let response = {
        info: "Incorrect Password",
        success: 0,
      };
      res.send(response);
    } else {
      res.send("Not allowed!");
    }
  } catch (error) {
    let response = {
      info: "No user found",
      status: 500,
    };
    res.send(response);
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(404).send("Please Log in");
  } else {
    try {
      let decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const userId = decoded._id;
      const findCriteria = {
        _id: new mongoose.Types.ObjectId(userId),
      };
      const userDetails = await User.findById(findCriteria);
      console.log(userDetails.refreshToken, userDetails, "LINE 138");
      if (userDetails.refreshToken !== refreshToken) {
        return res.sendStatus(403);
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, user) => {
          if (error) {
            return res.sendStatus(401);
          }

          const accessToken = jwt.sign(
            {
              _id: userDetails._id,
              role: userDetails.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "60m" }
          );
          console.log(accessToken, "AccessToken");

          res.json({ accessToken: accessToken });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(401).send("Invalid refresh token");
    }
  }
};

exports.logOut = async (req, res) => {
  const userId = req.user;
  try {
    const userDetails = await User.updateOne(
      { _id: userId },
      {
        $unset: {
          accessToken: "",
          refreshToken: "",
        },
      }
    );
    res.send("User logout");
  } catch (error) {
    console.log(error, "Logout error");
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user;
    const findCriteria = {
      _id: new mongoose.Types.ObjectId(userId),
    };

    const userDetails = await User.findById(findCriteria);

    let response = {
      info: "user exists",
      status: 200,
      success: 1,
      user_details: userDetails,
    };
    res.send(response);
  } catch (error) {
    console.log(error, "LINE 202");
  }
};

exports.postHouseDetails = async (req, res) => {
  try {
    const role = req.role;
    const payload = req.body;
    console.log(role, "206");
    console.log(payload);
    if (role !== "House Owner") {
      throw new Error("Not authorized for posting houses");
    }
    const saveHouse = await Houses(payload).save();

    let response = {
      status: 200,
      success: 1,
      message: "Successfully uploaded",
    };
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
};

exports.getHouseList = async (req, res) => {
  try {
    const userId = req.user;
    const findCriteria = {
      userId: userId,
    };

    const houseList = await Houses.find(findCriteria);
    res.status(200).json(houseList);
  } catch (error) {
    console.log(error);
  }
};

exports.editHouseDetails = async (req, res) => {
  try {
    const payload = req.body;
    const houseID = payload.houseId;
    const findCriteria = {
      _id: new mongoose.Types.ObjectId(houseID),
    };

    const updateData = {
      name: payload.name,
      address: payload.address,
      city: payload.city,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      roomSize: payload.roomSize,
      houseImage: payload.houseImage,
      availabilityData: payload.availabilityDate,
      rentPerMonth: payload.rentPerMonth,
      phoneNumber: payload.phoneNumber,
      description: payload.description,
    };

    const updatedHouse = await Houses.findByIdAndUpdate(
      findCriteria,
      updateData,
      { new: true }
    );

    let response = {
      success: 1,
      status: 200,
      message: "Successfully updated",
    };
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteHouse = async (req, res) => {
  try {
    const houseID = req.params.id;

    const deletedHouse = await Houses.findByIdAndDelete(houseID);

    if (!deletedHouse) {
      return res.status(404).json({ error: "House not found" });
    }
    let response = {
      success: 1,
      status: 200,
      message: "Successfully deleted",
    };
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteBookedHouse = async (req, res) => {
  try {
    const houseID = req.params.id;

    const deletedHouse = await Booking.findByIdAndDelete(houseID);

    if (!deletedHouse) {
      return res.status(404).json({ error: "House not found" });
    }
    let response = {
      success: 1,
      status: 200,
      message: "Successfully deleted",
    };
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllHousesList = async (req, res) => {
  try {
    const perPage = req.query.per_page;
    const page = req.query.page;

    console.log(perPage, page, "Line 332");

    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;

    const totalHouses = await Houses.countDocuments({});

    const bookingList = await Houses.find({})
      .skip(startIndex)
      .limit(endIndex)
      .exec();

    const response = {
      success: 1,
      status: 200,
      data: bookingList,
      totalHouses,
    };

    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

exports.bookHouse = async (req, res) => {
  const payload = req.body;
  const userEmail = payload.BookingUserData.email;
  const userName = payload.BookingUserData.name;
  const userPhoneNumber = payload.BookingUserData.phoneNumber;
  const userId = payload.BookingUserData.userId;
  const houseID = payload.housesID;
  console.log(payload, "line 322");
  const findCriteria = {
    _id: new mongoose.Types.ObjectId(houseID),
  };

  const findHouse = await Houses.findById(findCriteria);

  let bookingData = {
    name: findHouse.name,
    address: findHouse.address,
    city: findHouse.city,
    bedrooms: findHouse.bedrooms,
    bathrooms: findHouse.bathrooms,
    roomSize: findHouse.roomSize,
    houseImage: findHouse.houseImage,
    availabilityDate: findHouse.availabilityDate,
    rentPerMonth: findHouse.rentPerMonth,
    phoneNumber: findHouse.phoneNumber,
    description: findHouse.description,
    userId: userId,
    houseId: findHouse._id,
    userInfo: {
      name: userName,
      emailId: userEmail,
      phoneNumber: userPhoneNumber,
    },
  };

  const saveHouseToBooking = await Booking(bookingData).save();

  let response = {
    success: 1,
    status: 200,
    message: "successfully booked",
  };

  res.status(200).send(response);
};

exports.getBookedList = async (req, res) => {
  try {
    const allBookedList = await Booking.find({});
    let response = {
      success: 1,
      status: 200,
      data: allBookedList,
    };
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
};

exports.getHouseOwnerBookingList = async (req, res) => {
  try {
    const role = req.role;
    const user = req.user;

    if (role !== "House Owner") {
      throw new Error("Not authorized for see bookings houses");
    }

    const findCriteria = {
      userId: user,
    };
    const bookedHouses = await Booking.find(findCriteria);

    res.status(200).send(bookedHouses);
    console.log(bookedHouses, "line 391");
  } catch (error) {
    console.log(error);
  }
};

exports.getHouseRenterBookingList = async (req, res) => {
  try {
    const role = req.role;
    const userId = req.user;

    if (role !== "House Renter") {
      throw new Error("Not authorized for see bookings houses");
    }

    const findCriteria = {
      userId: userId,
    };

    const bookedHouseList = await Booking.find(findCriteria);
    res.status(200).send(bookedHouseList);
  } catch (error) {
    console.log(error);
  }
};
