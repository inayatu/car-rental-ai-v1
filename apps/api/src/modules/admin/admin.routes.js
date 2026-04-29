const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const adminController = require("./admin.controller");

const router = express.Router();

const staff = requireAuth(["admin", "govt_staff"]);

router.get("/stats", staff, adminController.getStats);

router.get("/bookings", staff, adminController.listBookings);
router.get("/bookings/:id", staff, adminController.getBookingById);

router.get("/vehicles/pending-moderation", staff, adminController.listVehiclesPendingModeration);
router.get("/vehicles/:id", staff, adminController.getVehicleById);
router.get("/vehicles", staff, adminController.listVehicles);

router.get("/users", staff, adminController.listUsers);
router.get("/users/:id", staff, adminController.getUserById);
router.patch("/users/:id", staff, adminController.patchUser);

module.exports = router;
