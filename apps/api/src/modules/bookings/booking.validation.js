const { z } = require("zod");
const { Messages } = require("../../constants/errorMessages");

const createBookingSchema = z.object({
  carId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  renterName: z
    .string()
    .max(200)
    .transform((s) => s.trim())
    .refine((s) => s.length >= 1, { message: Messages.validation.renterNameRequired })
    .refine((s) => s.length <= 200, { message: Messages.validation.renterNameTooLong }),
  numberOfPersons: z.coerce.number().int().min(1).max(50),
  renterPhone: z
    .string()
    .max(32)
    .transform((s) => s.trim())
    .refine((s) => s.length >= 5, { message: Messages.validation.phoneRequired }),
  renterEmail: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().min(1).max(320).email()
  ),
  notes: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().max(2000).optional()
  ),
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
    message: Messages.validation.updateRequiresOneField,
  });

module.exports = {
  createBookingSchema,
  bookingIdParamsSchema,
  updateBookingSchema,
};
