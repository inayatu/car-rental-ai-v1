const mongoose = require("mongoose");
const Booking = require("./booking.model");
const Car = require("../cars/car.model");

const BLOCKING_BOOKING_STATUSES = new Set(["requested", "accepted"]);
const ACTIVE_BOOKING_STATUSES = new Set(["requested", "accepted"]);

function ensureValidObjectId(id, fieldName = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`Invalid ${fieldName}`);
    err.status = 400;
    throw err;
  }
}

function calculateTotalDays(startDate, endDate) {
  const ms = endDate.getTime() - startDate.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return days;
}

function assertValidDateRange(startDate, endDate) {
  if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
    const err = new Error("Invalid start date");
    err.status = 400;
    throw err;
  }

  if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
    const err = new Error("Invalid end date");
    err.status = 400;
    throw err;
  }

  if (endDate <= startDate) {
    const err = new Error("endDate must be greater than startDate");
    err.status = 400;
    throw err;
  }
}

async function assertNoDateOverlap(carId, startDate, endDate, excludeBookingId) {
  const query = {
    carId,
    status: { $in: Array.from(BLOCKING_BOOKING_STATUSES) },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const exists = await Booking.exists(query);
  if (exists) {
    const err = new Error("Car is already booked for overlapping dates");
    err.status = 409;
    throw err;
  }
}

function appendTimeline(booking, action, actorId, actorRole, note) {
  booking.timeline.push({
    action,
    by: actorId,
    byRole: actorRole,
    note,
    at: new Date(),
  });
}

async function createBooking(renterId, renterRole, payload) {
  ensureValidObjectId(payload.carId, "car id");
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);
  assertValidDateRange(startDate, endDate);

  const car = await Car.findById(payload.carId);
  if (!car) {
    const err = new Error("Car not found");
    err.status = 404;
    throw err;
  }

  if (String(car.ownerId) === String(renterId)) {
    const err = new Error("Owner cannot create booking on own car");
    err.status = 400;
    throw err;
  }

  if (car.status !== "active") {
    const err = new Error("Car is not available for booking");
    err.status = 409;
    throw err;
  }

  if (car.verification?.status !== "verified") {
    const err = new Error("Car is not verified for booking");
    err.status = 409;
    throw err;
  }

  await assertNoDateOverlap(car._id, startDate, endDate);

  const totalDays = calculateTotalDays(startDate, endDate);
  const quotedAmount = Number(car.basePricePerDay) * totalDays;

  const booking = await Booking.create({
    carId: car._id,
    ownerId: car.ownerId,
    renterId,
    startDate,
    endDate,
    totalDays,
    quotedAmount,
    currency: car.currency || "PKR",
    status: "requested",
    timeline: [
      {
        action: "requested",
        by: renterId,
        byRole: renterRole,
        note: "Booking requested by renter.",
        at: new Date(),
      },
    ],
  });

  return booking;
}

async function listMyBookings(actorId, actorRole) {
  const query = {};

  if (actorRole === "renter") {
    query.renterId = actorId;
  } else if (actorRole === "owner") {
    query.ownerId = actorId;
  } else {
    query.$or = [{ renterId: actorId }, { ownerId: actorId }];
  }

  return Booking.find(query).sort({ createdAt: -1 });
}

async function getBookingByIdForActor(actorId, actorRole, bookingId) {
  ensureValidObjectId(bookingId, "booking id");
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.status = 404;
    throw err;
  }

  if (actorRole === "admin" || actorRole === "govt_staff") {
    return booking;
  }

  const isRenter = String(booking.renterId) === String(actorId);
  const isOwner = String(booking.ownerId) === String(actorId);
  if (!isRenter && !isOwner) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  return booking;
}

function assertBookingUpdateAllowed(booking, actorId, actorRole, updates) {
  const requestedStatus = updates.status;
  const currentStatus = booking.status;
  const isRenter = String(booking.renterId) === String(actorId);
  const isOwner = String(booking.ownerId) === String(actorId);
  const isStaff = actorRole === "admin" || actorRole === "govt_staff";

  if (!requestedStatus) {
    const err = new Error("status is required");
    err.status = 400;
    throw err;
  }

  if (isStaff) {
    return;
  }

  if (isRenter) {
    if (requestedStatus !== "cancelled") {
      const err = new Error("Renter can only cancel own booking");
      err.status = 403;
      throw err;
    }
    if (!ACTIVE_BOOKING_STATUSES.has(currentStatus)) {
      const err = new Error("Only active bookings can be cancelled");
      err.status = 409;
      throw err;
    }
    return;
  }

  if (isOwner) {
    if (!["accepted", "rejected", "completed", "cancelled"].includes(requestedStatus)) {
      const err = new Error("Owner cannot set this booking status");
      err.status = 403;
      throw err;
    }

    if (requestedStatus === "accepted" || requestedStatus === "rejected") {
      if (currentStatus !== "requested") {
        const err = new Error("Only requested bookings can be accepted or rejected");
        err.status = 409;
        throw err;
      }
      return;
    }

    if (requestedStatus === "completed") {
      if (currentStatus !== "accepted") {
        const err = new Error("Only accepted bookings can be completed");
        err.status = 409;
        throw err;
      }
      return;
    }

    if (requestedStatus === "cancelled" && !ACTIVE_BOOKING_STATUSES.has(currentStatus)) {
      const err = new Error("Only active bookings can be cancelled");
      err.status = 409;
      throw err;
    }
    return;
  }

  const err = new Error("Forbidden");
  err.status = 403;
  throw err;
}

async function updateBookingStatus(actorId, actorRole, bookingId, updates) {
  const booking = await getBookingByIdForActor(actorId, actorRole, bookingId);
  assertBookingUpdateAllowed(booking, actorId, actorRole, updates);

  const nextStatus = updates.status;
  const note = updates.note || updates.cancellationReason;

  if (nextStatus === "accepted") {
    await assertNoDateOverlap(booking.carId, booking.startDate, booking.endDate, booking._id);
  }

  booking.status = nextStatus;

  if (nextStatus === "cancelled" || nextStatus === "rejected") {
    booking.cancellationReason = updates.cancellationReason || note || booking.cancellationReason;
  }

  appendTimeline(
    booking,
    nextStatus,
    actorId,
    actorRole,
    note || `Booking moved to ${nextStatus}`
  );

  await booking.save();
  return booking;
}

async function deleteBooking(actorId, actorRole, bookingId) {
  const booking = await getBookingByIdForActor(actorId, actorRole, bookingId);

  const isStaff = actorRole === "admin" || actorRole === "govt_staff";
  const isRenter = String(booking.renterId) === String(actorId);
  if (!isStaff && !isRenter) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  if (!["requested", "cancelled", "rejected"].includes(booking.status) && !isStaff) {
    const err = new Error("Only requested/cancelled/rejected bookings can be deleted");
    err.status = 409;
    throw err;
  }

  await Booking.deleteOne({ _id: booking._id });
  return { success: true };
}

module.exports = {
  createBooking,
  listMyBookings,
  getBookingByIdForActor,
  updateBookingStatus,
  deleteBooking,
};
