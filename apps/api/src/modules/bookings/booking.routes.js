const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const bookingController = require("./booking.controller");

const router = express.Router();

router.post("/", requireAuth(["renter"]), bookingController.createBooking);
router.get(
  "/mine",
  requireAuth(["renter", "owner", "admin", "govt_staff"]),
  bookingController.listMyBookings
);
router.get(
  "/:id",
  requireAuth(["renter", "owner", "admin", "govt_staff"]),
  bookingController.getBookingById
);
router.patch(
  "/:id",
  requireAuth(["renter", "owner", "admin", "govt_staff"]),
  bookingController.updateBooking
);
router.delete(
  "/:id",
  requireAuth(["renter", "admin", "govt_staff"]),
  bookingController.deleteBooking
);

module.exports = router;
