const {
  createCarSchema,
  updateCarSchema,
  carIdParamsSchema,
  moderateCarSchema,
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
  };
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
    const cars = await carService.listOwnerCars(req.user.sub);
    return res.status(200).json({ cars: cars.map(sanitizeCar) });
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
    return res.status(200).json(result);
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

module.exports = {
  createCar,
  listMyCars,
  getMyCarById,
  updateMyCar,
  deleteMyCar,
  listPendingModeration,
  verifyCar,
  unverifyCar,
  blacklistCar,
};
