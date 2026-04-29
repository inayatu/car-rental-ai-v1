const mongoose = require("mongoose");
const Booking = require("../bookings/booking.model");
const User = require("../users/user.model");
const Car = require("../cars/car.model");
const bookingService = require("../bookings/booking.service");
const bookingController = require("../bookings/booking.controller");
const carService = require("../cars/car.service");
const carController = require("../cars/car.controller");
const { invalidField } = require("../../constants/errorMessages");
const {
  paginationQuerySchema,
  adminBookingListQuerySchema,
  userIdParamsSchema,
  patchAdminUserSchema,
} = require("./admin.validation");

function invalidIdError() {
  const err = new Error(invalidField("id"));
  err.status = 400;
  return err;
}

async function getStats(_req, res, next) {
  try {
    const [
      bookingsTotal,
      usersTotal,
      vehiclesTotal,
      bookingsActive,
      pendingModeration,
      volumeAgg,
    ] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments(),
      Car.countDocuments({ isDeleted: { $ne: true } }),
      Booking.countDocuments({ status: { $in: ["requested", "accepted"] } }),
      Car.countDocuments({
        "verification.status": { $in: ["pending", "unverified"] },
        isDeleted: { $ne: true },
      }),
      Booking.aggregate([
        {
          $group: {
            _id: null,
            totalQuoted: { $sum: { $ifNull: ["$quotedAmount", 0] } },
          },
        },
      ]),
    ]);

    const quotedVolumeTotal = volumeAgg[0]?.totalQuoted ?? 0;

    return res.status(200).json({
      bookingsTotal,
      usersTotal,
      vehiclesTotal,
      bookingsActive,
      pendingModeration,
      quotedVolumeTotal,
    });
  } catch (error) {
    return next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const q = paginationQuerySchema.parse(req.query);
    const page = q.page;
    const limit = q.limit;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-passwordHash -refreshTokens")
        .lean(),
      User.countDocuments({}),
    ]);

    return res.status(200).json({
      users,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = userIdParamsSchema.parse(req.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(invalidIdError());
    }
    const user = await User.findById(id).select("-passwordHash -refreshTokens").lean();
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function patchUser(req, res, next) {
  try {
    const { id } = userIdParamsSchema.parse(req.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(invalidIdError());
    }
    const body = patchAdminUserSchema.parse(req.body || {});

    if (body.role != null && req.user.role !== "admin") {
      const err = new Error("Only admin may change user roles");
      err.status = 403;
      throw err;
    }

    const user = await User.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
      .select("-passwordHash -refreshTokens")
      .lean();

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function listBookings(req, res, next) {
  try {
    const q = adminBookingListQuerySchema.parse(req.query);
    const { items, total, page, limit } = await bookingService.listBookingsAdmin({
      page: q.page,
      limit: q.limit,
      status: q.status,
    });
    const actorId = req.user.sub;
    const actorRole = req.user.role;
    const bookings = items.map((doc) => bookingController.sanitizeBooking(doc, actorId, actorRole));
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return res.status(200).json({ bookings, total, page, limit, totalPages });
  } catch (error) {
    return next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = userIdParamsSchema.parse(req.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(invalidIdError());
    }
    const booking = await bookingService.getBookingByIdForActor(req.user.sub, req.user.role, id);
    return res.status(200).json({
      booking: bookingController.sanitizeBooking(booking, req.user.sub, req.user.role),
    });
  } catch (error) {
    return next(error);
  }
}

async function listVehicles(req, res, next) {
  try {
    const q = paginationQuerySchema.parse(req.query);
    const { items, total, page, limit } = await carService.listAllCarsAdmin({
      page: q.page,
      limit: q.limit,
    });
    const cars = items.map((c) => carController.sanitizeCar(c));
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return res.status(200).json({ cars, total, page, limit, totalPages });
  } catch (error) {
    return next(error);
  }
}

async function listVehiclesPendingModeration(_req, res, next) {
  try {
    const cars = await carService.listPendingModerationCars();
    return res.status(200).json({
      cars: cars.map((c) => carController.sanitizeCar(c)),
    });
  } catch (error) {
    return next(error);
  }
}

async function getVehicleById(req, res, next) {
  try {
    const { id } = userIdParamsSchema.parse(req.params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(invalidIdError());
    }
    const car = await Car.findById(id).populate("ownerId", "name email phone").lean();
    if (!car) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }
    return res.status(200).json({ car: carController.sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats,
  listUsers,
  getUserById,
  patchUser,
  listBookings,
  getBookingById,
  listVehicles,
  getVehicleById,
  listVehiclesPendingModeration,
};
