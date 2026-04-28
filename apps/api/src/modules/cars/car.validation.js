const { z } = require("zod");
const { Messages } = require("../../constants/errorMessages");

const fileUrlSchema = z.string().min(1).refine(
  (value) => {
    if (value.startsWith("/uploads/")) {
      return true;
    }

    try {
      const parsed = new URL(value);
      return Boolean(parsed.protocol && parsed.host);
    } catch (_error) {
      return false;
    }
  },
  { message: Messages.validation.invalidFileUrl }
);

const carDocumentSchema = z.object({
  docType: z.string().min(2),
  url: fileUrlSchema,
  number: z.string().optional(),
  issuedBy: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

const createCarSchema = z.object({
  title: z.string().min(2),
  brand: z.string().min(2),
  model: z.string().min(1),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(3),
  color: z.string().optional(),
  seats: z.number().int().min(1).max(12).optional(),
  transmission: z.enum(["manual", "automatic"]).optional(),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric"]).optional(),
  vehicleType: z.enum(["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"]),
  basePricePerDay: z.number().nonnegative(),
  currency: z.string().min(3).max(3).optional(),
  location: z.object({
    district: z.string().min(2),
    city: z.string().optional(),
  }),
  status: z.enum(["draft", "active", "paused"]).optional(),
  description: z.string().optional(),
  images: z.array(fileUrlSchema).max(5).optional(),
  documents: z.array(carDocumentSchema).min(1),
});

const updateCarSchema = createCarSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: Messages.validation.updateRequiresOneField }
);

const carIdParamsSchema = z.object({
  id: z.string().min(1),
});

const moderateCarSchema = z.object({
  reason: z.string().min(3).optional(),
  notes: z.string().min(3).optional(),
});

const publicCarListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    district: z.string().max(100).optional(),
    fuelType: z.enum(["petrol", "diesel", "hybrid", "electric"]).optional(),
    transmission: z.enum(["manual", "automatic"]).optional(),
    vehicleType: z.enum(["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"]).optional(),
    q: z.string().max(200).optional(),
    sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  })
  .strip();

module.exports = {
  createCarSchema,
  updateCarSchema,
  carIdParamsSchema,
  moderateCarSchema,
  publicCarListQuerySchema,
};
