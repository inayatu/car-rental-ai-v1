const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  role: z.enum(["renter", "owner"]).optional(),
});

const loginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(8),
});

const refreshBodySchema = z
  .object({
    refreshToken: z.string().min(10).optional(),
  })
  .strict();

const logoutBodySchema = z
  .object({
    refreshToken: z.string().min(10).optional(),
  })
  .strict();

const profilePatchSchema = z
  .object({
    name: z.string().min(2).max(80).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(8).max(20).optional(),
  })
  .strict()
  .refine((b) => Object.keys(b).length > 0, { message: "At least one field is required" });

module.exports = {
  registerSchema,
  loginSchema,
  refreshBodySchema,
  logoutBodySchema,
  profilePatchSchema,
};
