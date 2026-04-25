const {
  createBookingSchema,
  bookingIdParamsSchema,
  updateBookingSchema,
} = require("./booking.validation");
const bookingService = require("./booking.service");

function sanitizeBooking(booking) {
  return {
    id: booking._id,
    carId: booking.carId,
    ownerId: booking.ownerId,
    renterId: booking.renterId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalDays: booking.totalDays,
    quotedAmount: booking.quotedAmount,
    currency: booking.currency,
    status: booking.status,
    cancellationReason: booking.cancellationReason,
    timeline: booking.timeline,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

async function createBooking(req, res, next) {
  try {
    const payload = createBookingSchema.parse(req.body);
    const booking = await bookingService.createBooking(req.user.sub, req.user.role, payload);
    return res.status(201).json({ booking: sanitizeBooking(booking) });
  } catch (error) {
    return next(error);
  }
}

async function listMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.listMyBookings(req.user.sub, req.user.role);
    return res.status(200).json({ bookings: bookings.map(sanitizeBooking) });
  } catch (error) {
    return next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = bookingIdParamsSchema.parse(req.params);
    const booking = await bookingService.getBookingByIdForActor(req.user.sub, req.user.role, id);
    return res.status(200).json({ booking: sanitizeBooking(booking) });
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
    return res.status(200).json({ booking: sanitizeBooking(booking) });
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
};
