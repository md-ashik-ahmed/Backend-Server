const express = require("express");
const {
  registerNewUser,
  refreshToken,
  logOut,
  logIn,
  getUserDetails,
  postHouseDetails,
  getHouseList,
  editHouseDetails,
  deleteHouse,
  getAllHousesList,
  bookHouse,
  getBookedList,
  getHouseOwnerBookingList,
  getHouseRenterBookingList,
  deleteBookedHouse,
} = require("../Controller/controller");
const { verifyJwtToken } = require("../Middleware/verifyToken");
const router = express.Router();

router.use(express.json());

router.get("/house_list", verifyJwtToken, getHouseList);
router.get("/booked_houses", verifyJwtToken, getHouseOwnerBookingList);
router.get("/renter_booked_houses", verifyJwtToken, getHouseRenterBookingList);
router.get("/all_houses_list", getAllHousesList);
router.get("/booking_list", getBookedList);

router.post("/register", registerNewUser);
router.post("/log_in", logIn);
router.post("/get_user_details", verifyJwtToken, getUserDetails);
router.post("/logout", verifyJwtToken, logOut);
router.post("/house_details", verifyJwtToken, postHouseDetails);
router.post("/bookings", verifyJwtToken, bookHouse);
router.post("/refresh_token", refreshToken);

router.patch("/edit_house_details", verifyJwtToken, editHouseDetails);

router.delete("/delete_houses/:id", verifyJwtToken, deleteHouse);
router.delete("/delete_booked_houses/:id", verifyJwtToken, deleteBookedHouse);

module.exports = router;
