const {
  createCarSchema,
  updateCarSchema,
  carIdParamsSchema,
  moderateCarSchema,
  publicCarListQuerySchema,
} = require("./car.validation");
const carService = require("./car.service");
const { processCarUploads } = require("./car-upload.service");

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

function parseLocation(body) {
  if (body.location && typeof body.location === "string") {
    try {
      const parsed = JSON.parse(body.location);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (_error) {
      return {
        district: body.district || "",
        city: body.city || undefined,
      };
    }
  }

  if (body.location && typeof body.location === "object") {
    return body.location;
  }

  return {
    district: body.district || "",
    city: body.city || undefined,
  };
}

function buildCreatePayload(body, uploadData) {
  const bodyImages = parseJsonArray(body.images);
  const bodyDocuments = parseJsonArray(body.documents);

  return {
    title: body.title,
    brand: body.brand,
    model: body.model,
    year: parseNumber(body.year),
    registrationNumber: body.registrationNumber,
    color: body.color,
    seats: parseNumber(body.seats),
    transmission: body.transmission,
    fuelType: body.fuelType,
    vehicleType: body.vehicleType,
    basePricePerDay: parseNumber(body.basePricePerDay),
    currency: body.currency,
    location: parseLocation(body),
    status: body.status,
    description: body.description,
    images: [...bodyImages, ...uploadData.imageUrls],
    documents: [...bodyDocuments, ...uploadData.documents],
  };
}

function buildUpdatePayload(body, uploadData) {
  const payload = {};

  if (body.title !== undefined) payload.title = body.title;
  if (body.brand !== undefined) payload.brand = body.brand;
  if (body.model !== undefined) payload.model = body.model;
  if (body.year !== undefined) payload.year = parseNumber(body.year);
  if (body.registrationNumber !== undefined) payload.registrationNumber = body.registrationNumber;
  if (body.color !== undefined) payload.color = body.color;
  if (body.seats !== undefined) payload.seats = parseNumber(body.seats);
  if (body.transmission !== undefined) payload.transmission = body.transmission;
  if (body.fuelType !== undefined) payload.fuelType = body.fuelType;
  if (body.vehicleType !== undefined) payload.vehicleType = body.vehicleType;
  if (body.basePricePerDay !== undefined) payload.basePricePerDay = parseNumber(body.basePricePerDay);
  if (body.currency !== undefined) payload.currency = body.currency;
  if (body.status !== undefined) payload.status = body.status;
  if (body.description !== undefined) payload.description = body.description;
  if (body.location !== undefined || body.district !== undefined || body.city !== undefined) {
    payload.location = parseLocation(body);
  }

  if (body.images !== undefined || uploadData.imageUrls.length > 0) {
    payload.images = [...parseJsonArray(body.images), ...uploadData.imageUrls];
  }

  if (body.documents !== undefined || uploadData.documents.length > 0) {
    payload.documents = [...parseJsonArray(body.documents), ...uploadData.documents];
  }

  return payload;
}

function sanitizePublicCar(car) {
  const ownerName =
    car.ownerId && typeof car.ownerId === "object" && car.ownerId.name
      ? car.ownerId.name
      : null;
  const blacklisted = car.verification?.status === "blacklisted";
  return {
    id: car._id,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    seats: car.seats,
    fuelType: car.fuelType,
    transmission: car.transmission,
    vehicleType: car.vehicleType || "other",
    basePricePerDay: car.basePricePerDay,
    currency: car.currency,
    location: car.location,
    description: car.description,
    images: Array.isArray(car.images) ? car.images.slice(0, 5) : car.images,
    ownerName,
    blacklisted,
    verification: {
      verifiedBadge: !!car.verification?.verifiedBadge && !blacklisted,
      status: blacklisted ? "blacklisted" : "verified",
    },
  };
}

function sanitizeCar(car) {
  return {
    id: car._id,
    ownerId: car.ownerId,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    registrationNumber: car.registrationNumber,
    color: car.color,
    seats: car.seats,
    transmission: car.transmission,
    fuelType: car.fuelType,
    vehicleType: car.vehicleType || "other",
    basePricePerDay: car.basePricePerDay,
    currency: car.currency,
    location: car.location,
    status: car.status,
    description: car.description,
    images: car.images,
    documents: car.documents,
    verification: car.verification,
    moderationHistory: car.moderationHistory,
    createdAt: car.createdAt,
    updatedAt: car.updatedAt,
    isDeleted: car.isDeleted,
    deletedAt: car.deletedAt,
  };
}

async function listPublicCars(req, res, next) {
  try {
    const query = publicCarListQuerySchema.parse(req.query);
    const { items, total, page, limit } = await carService.listPublicCars(query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);
    return res.status(200).json({
      cars: items.map(sanitizePublicCar),
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    });
  } catch (error) {
    return next(error);
  }
}

async function getPublicCarById(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const car = await carService.getPublicCarById(id);
    return res.status(200).json({ car: sanitizePublicCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function createCar(req, res, next) {
  try {
    const uploadData = await processCarUploads(req.files, req.body.documentTypes);
    const payload = createCarSchema.parse(buildCreatePayload(req.body, uploadData));
    const car = await carService.createCar(req.user.sub, payload);
    return res.status(201).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function listMyCars(req, res, next) {
  try {
    const includeDeleted = String(req.query?.includeDeleted || "") === "1" || String(req.query?.includeDeleted) === "true";
    const cars = await carService.listOwnerCars(req.user.sub, { includeDeleted });
    return res.status(200).json({ cars: cars.map(sanitizeCar) });
  } catch (error) {
    return next(error);
  }
}

async function listAllCarsAdmin(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const { items, total, page: p, limit: l } = await carService.listAllCarsAdmin({ page, limit });
    const totalPages = total === 0 ? 0 : Math.ceil(total / l);
    return res.status(200).json({
      cars: items.map(sanitizeCar),
      page: p,
      limit: l,
      total,
      totalPages,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMyCarById(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const car = await carService.getOwnerCarById(req.user.sub, id);
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function updateMyCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const uploadData = await processCarUploads(req.files, req.body.documentTypes);
    const payload = updateCarSchema.parse(buildUpdatePayload(req.body, uploadData));
    const car = await carService.updateOwnerCar(req.user.sub, id, payload);
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function deleteMyCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const result = await carService.deleteOwnerCar(req.user.sub, id);
    return res.status(200).json({ success: result.success, soft: true, car: sanitizeCar(result.car) });
  } catch (error) {
    return next(error);
  }
}

async function restoreMyCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const car = await carService.restoreOwnerCar(req.user.sub, id);
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function listPendingModeration(req, res, next) {
  try {
    const cars = await carService.listPendingModerationCars();
    return res.status(200).json({ cars: cars.map(sanitizeCar) });
  } catch (error) {
    return next(error);
  }
}

async function verifyCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const payload = moderateCarSchema.parse(req.body || {});
    const car = await carService.moderateCar(
      id,
      req.user.sub,
      req.user.role,
      carService.MODERATION_ACTIONS.VERIFY,
      payload
    );
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function unverifyCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const payload = moderateCarSchema.parse(req.body || {});
    const car = await carService.moderateCar(
      id,
      req.user.sub,
      req.user.role,
      carService.MODERATION_ACTIONS.UNVERIFY,
      payload
    );
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function blacklistCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const payload = moderateCarSchema.parse(req.body || {});
    const car = await carService.moderateCar(
      id,
      req.user.sub,
      req.user.role,
      carService.MODERATION_ACTIONS.BLACKLIST,
      payload
    );
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

async function unblacklistCar(req, res, next) {
  try {
    const { id } = carIdParamsSchema.parse(req.params);
    const payload = moderateCarSchema.parse(req.body || {});
    const car = await carService.moderateCar(
      id,
      req.user.sub,
      req.user.role,
      carService.MODERATION_ACTIONS.UNBLACKLIST,
      payload
    );
    return res.status(200).json({ car: sanitizeCar(car) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPublicCars,
  getPublicCarById,
  createCar,
  listMyCars,
  listAllCarsAdmin,
  sanitizeCar,
  getMyCarById,
  updateMyCar,
  deleteMyCar,
  restoreMyCar,
  listPendingModeration,
  verifyCar,
  unverifyCar,
  blacklistCar,
  unblacklistCar,
};
