const {
  createBookingSchema,
  bookingIdParamsSchema,
  updateBookingSchema,
} = require("./booking.validation");
const bookingService = require("./booking.service");

/** Renter (and clients) only receive host identity once the rental is agreed or finished — not on requests or declines. */
const BOOKING_STATUS_WITH_HOST = new Set(["accepted", "completed"]);
const BOOKING_STATUS_WITH_RENTER_CONTACT = new Set(["accepted", "completed"]);

function bookingActorFlags(booking, actorId, actorRole) {
  const renterId =
    booking.renterId && typeof booking.renterId === "object" && booking.renterId._id
      ? booking.renterId._id
      : booking.renterId;
  const ownerId =
    booking.ownerId && typeof booking.ownerId === "object" && booking.ownerId._id
      ? booking.ownerId._id
      : booking.ownerId;
  const isStaff = actorRole === "admin" || actorRole === "govt_staff";
  const isRenter = String(renterId) === String(actorId);
  const isOwner = String(ownerId) === String(actorId);
  return { isStaff, isRenter, isOwner, renterId, ownerId };
}

function bookingCarSummary(car) {
  if (!car || typeof car !== "object" || !car._id) {
    return null;
  }
  const images = Array.isArray(car.images) ? car.images.filter(Boolean) : [];
  return {
    id: car._id,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    image: images[0] || null,
    images: images.slice(0, 5),
    basePricePerDay: car.basePricePerDay,
    currency: car.currency,
    location: car.location,
    color: car.color,
    vehicleType: car.vehicleType,
    registrationNumber: car.registrationNumber,
    seats: car.seats,
    transmission: car.transmission,
    fuelType: car.fuelType,
  };
}

function sanitizeBooking(booking, actorId, actorRole) {
  const flags = bookingActorFlags(booking, actorId, actorRole);
  const carId =
    booking.carId && typeof booking.carId === "object" && booking.carId._id
      ? booking.carId._id
      : booking.carId;
  const exposeHost = BOOKING_STATUS_WITH_HOST.has(booking.status);
  const exposeRenterContactToOwner = BOOKING_STATUS_WITH_RENTER_CONTACT.has(booking.status);
  const out = {
    id: booking._id,
    carId,
    renterId: flags.renterId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    numberOfPersons: booking.numberOfPersons,
    notes: booking.notes,
    totalDays: booking.totalDays,
    quotedAmount: booking.quotedAmount,
    currency: booking.currency,
    status: booking.status,
    cancellationReason: booking.cancellationReason,
    timeline: booking.timeline,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
  if (flags.isRenter || flags.isStaff || exposeRenterContactToOwner) {
    out.renterName = booking.renterName;
    out.renterPhone = booking.renterPhone;
    out.renterEmail = booking.renterEmail;
  }
  if (booking.carId && typeof booking.carId === "object" && booking.carId._id) {
    out.car = bookingCarSummary(booking.carId);
  }
  if (exposeHost) {
    out.ownerId = flags.ownerId;
  }
  if (
    booking.renterId &&
    typeof booking.renterId === "object" &&
    (booking.renterId._id || "name" in booking.renterId)
  ) {
    if (flags.isRenter || flags.isStaff || exposeRenterContactToOwner) {
      out.renterAccount = {
        name: booking.renterId.name,
        email: booking.renterId.email,
        phone: booking.renterId.phone,
      };
    }
  }
  if (
    (exposeHost || flags.isStaff) &&
    booking.ownerId &&
    typeof booking.ownerId === "object" &&
    ("name" in booking.ownerId || "email" in booking.ownerId || "phone" in booking.ownerId)
  ) {
    out.ownerAccount = {
      name: booking.ownerId.name,
      email: booking.ownerId.email,
      phone: booking.ownerId.phone,
    };
  }
  return out;
}

async function createBooking(req, res, next) {
  try {
    const payload = createBookingSchema.parse(req.body);
    const booking = await bookingService.createBooking(req.user.sub, req.user.role, payload);
    return res.status(201).json({ booking: sanitizeBooking(booking, req.user.sub, req.user.role) });
  } catch (error) {
    return next(error);
  }
}

async function listMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.listMyBookings(req.user.sub, req.user.role);
    return res.status(200).json({
      bookings: bookings.map((booking) => sanitizeBooking(booking, req.user.sub, req.user.role)),
    });
  } catch (error) {
    return next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = bookingIdParamsSchema.parse(req.params);
    const booking = await bookingService.getBookingByIdForActor(req.user.sub, req.user.role, id);
    return res.status(200).json({ booking: sanitizeBooking(booking, req.user.sub, req.user.role) });
  } catch (error) {
    return next(error);
  }
}

async function updateBooking(req, res, next) {
  try {
    const { id } = bookingIdParamsSchema.parse(req.params);
    const payload = updateBookingSchema.parse(req.body);
    const booking = await bookingService.updateBookingStatus(
      req.user.sub,
      req.user.role,
      id,
      payload
    );
    return res.status(200).json({ booking: sanitizeBooking(booking, req.user.sub, req.user.role) });
  } catch (error) {
    return next(error);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const { id } = bookingIdParamsSchema.parse(req.params);
    const result = await bookingService.deleteBooking(req.user.sub, req.user.role, id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBooking,
  listMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  sanitizeBooking,
};
