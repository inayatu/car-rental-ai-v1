const { z } = require("zod");

const createBookingSchema = z.object({
  carId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const bookingIdParamsSchema = z.object({
  id: z.string().min(1),
});

const updateBookingSchema = z
  .object({
    status: z.enum(["accepted", "rejected", "cancelled", "completed"]).optional(),
    cancellationReason: z.string().min(3).optional(),
    note: z.string().min(3).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

module.exports = {
  createBookingSchema,
  bookingIdParamsSchema,
  updateBookingSchema,
};
