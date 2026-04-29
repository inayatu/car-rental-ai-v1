const { z } = require("zod");

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

const adminBookingListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["requested", "accepted", "rejected", "cancelled", "completed"]).optional(),
});

const userIdParamsSchema = z.object({
  id: z.string().min(1),
});

const patchAdminUserSchema = z
  .object({
    role: z.enum(["renter", "owner", "admin", "govt_staff"]).optional(),
    verificationStatus: z.enum(["pending", "under_review", "verified", "rejected"]).optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });

module.exports = {
  paginationQuerySchema,
  adminBookingListQuerySchema,
  userIdParamsSchema,
  patchAdminUserSchema,
};
