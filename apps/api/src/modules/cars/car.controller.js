const {
  createCarSchema,
  updateCarSchema,
  carIdParamsSchema,
  moderateCarSchema,
} = require("./car.validation");
const carService = require("./car.service");

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
    const payload = createCarSchema.parse(req.body);
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
    const payload = updateCarSchema.parse(req.body);
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
