const mongoose = require("mongoose");
const Car = require("./car.model");

const MODERATION_ACTIONS = {
  VERIFY: "verify",
  UNVERIFY: "unverify",
  BLACKLIST: "blacklist",
};

function ensureValidObjectId(id, fieldName = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(`Invalid ${fieldName}`);
    err.status = 400;
    throw err;
  }
}

async function createCar(ownerId, payload) {
  const now = new Date();
  const images = Array.isArray(payload.images) ? payload.images.slice(0, 5) : payload.images;
  const car = await Car.create({
    ...payload,
    images,
    ownerId,
    registrationNumber: payload.registrationNumber.toUpperCase(),
    verification: {
      status: "pending",
      verifiedBadge: false,
      lastActionAt: now,
      lastActionBy: ownerId,
      lastActionByRole: "owner",
    },
    moderationHistory: [
      {
        action: "submitted",
        by: ownerId,
        byRole: "owner",
        reason: "Owner submitted car for review.",
        at: now,
      },
    ],
  });
  return car;
}

async function listOwnerCars(ownerId, options = {}) {
  const { includeDeleted = false } = options;
  const filter = { ownerId };
  if (!includeDeleted) {
    filter.isDeleted = { $ne: true };
  }
  return Car.find(filter).sort({ createdAt: -1 });
}

async function getOwnerCarById(ownerId, carId) {
  ensureValidObjectId(carId, "car id");
  const car = await Car.findOne({ _id: carId, ownerId });

  if (!car) {
    const err = new Error("Car not found");
    err.status = 404;
    throw err;
  }

  return car;
}

async function updateOwnerCar(ownerId, carId, updates) {
  ensureValidObjectId(carId, "car id");
  const payload = { ...updates };
  if (Array.isArray(payload.images)) {
    payload.images = payload.images.slice(0, 5);
  }

  if (payload.registrationNumber) {
    payload.registrationNumber = payload.registrationNumber.toUpperCase();
  }

  const hasModerationRelevantChanges =
    Boolean(payload.documents) || Boolean(payload.registrationNumber) || Boolean(payload.images);

  if (hasModerationRelevantChanges) {
    payload.verification = {
      status: "pending",
      verifiedBadge: false,
      verifiedAt: null,
      verifiedBy: null,
      notes: "Re-submitted after owner update.",
      lastActionAt: new Date(),
      lastActionBy: ownerId,
      lastActionByRole: "owner",
    };
    payload.$push = {
      moderationHistory: {
        action: "submitted",
        by: ownerId,
        byRole: "owner",
        reason: "Owner updated details/documents; review required again.",
      },
    };
  }

  const car = await Car.findOne({ _id: carId, ownerId });

  if (!car) {
    const err = new Error("Car not found");
    err.status = 404;
    throw err;
  }
  if (car.isDeleted) {
    const err = new Error("This listing was removed. Restore it before editing.");
    err.status = 400;
    throw err;
  }

  Object.keys(payload).forEach((key) => {
    if (key !== "$push") {
      car.set(key, payload[key]);
    }
  });

  if (payload.$push && payload.$push.moderationHistory) {
    car.moderationHistory.push(payload.$push.moderationHistory);
  }

  await car.save();

  return car;
}

async function deleteOwnerCar(ownerId, carId) {
  ensureValidObjectId(carId, "car id");

  const updated = await Car.findOneAndUpdate(
    { _id: carId, ownerId, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
  if (!updated) {
    const err = new Error("Car not found or already removed");
    err.status = 404;
    throw err;
  }

  return { success: true, soft: true, car: updated };
}

async function restoreOwnerCar(ownerId, carId) {
  ensureValidObjectId(carId, "car id");

  const car = await Car.findOneAndUpdate(
    { _id: carId, ownerId, isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null } },
    { new: true }
  );
  if (!car) {
    const err = new Error("Car not found or not removed");
    err.status = 404;
    throw err;
  }
  return car;
}

async function listPendingModerationCars() {
  return Car.find({
    "verification.status": { $in: ["pending", "unverified"] },
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });
}

async function moderateCar(carId, moderatorId, moderatorRole, action, payload = {}) {
  ensureValidObjectId(carId, "car id");
  ensureValidObjectId(moderatorId, "moderator id");

  if (!Object.values(MODERATION_ACTIONS).includes(action)) {
    const err = new Error("Invalid moderation action");
    err.status = 400;
    throw err;
  }

  const car = await Car.findById(carId);
  if (!car) {
    const err = new Error("Car not found");
    err.status = 404;
    throw err;
  }
  if (car.isDeleted) {
    const err = new Error("This listing is no longer active");
    err.status = 404;
    throw err;
  }

  const now = new Date();
  const reason = payload.reason || payload.notes;

  if (
    (action === MODERATION_ACTIONS.UNVERIFY || action === MODERATION_ACTIONS.BLACKLIST) &&
    !reason
  ) {
    const err = new Error("Reason is required for unverify/blacklist actions");
    err.status = 400;
    throw err;
  }

  if (action === MODERATION_ACTIONS.VERIFY) {
    car.verification.status = "verified";
    car.verification.verifiedBadge = true;
    car.verification.verifiedAt = now;
    car.verification.verifiedBy = moderatorId;
    car.verification.notes = payload.notes || reason || "Car verified by moderator.";
  }

  if (action === MODERATION_ACTIONS.UNVERIFY) {
    car.verification.status = "unverified";
    car.verification.verifiedBadge = false;
    car.verification.notes = payload.notes || reason || "Car marked as unverified.";
  }

  if (action === MODERATION_ACTIONS.BLACKLIST) {
    car.verification.status = "blacklisted";
    car.verification.verifiedBadge = false;
    car.verification.notes = payload.notes || reason || "Car blacklisted by moderator.";
    car.status = "paused";
  }

  car.verification.lastActionAt = now;
  car.verification.lastActionBy = moderatorId;
  car.verification.lastActionByRole = moderatorRole;
  car.moderationHistory.push({
    action: action === MODERATION_ACTIONS.VERIFY ? "verified" : action,
    by: moderatorId,
    byRole: moderatorRole,
    reason,
    at: now,
  });

  await car.save();
  return car;
}

async function listPublicCars(options) {
  const {
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
    district,
    fuelType,
    transmission,
    vehicleType,
    q,
    sort = "newest",
  } = options;

  const filter = {
    status: "active",
    "verification.status": "verified",
    isDeleted: { $ne: true },
  };

  const priceRange = {};
  if (minPrice != null) {
    priceRange.$gte = minPrice;
  }
  if (maxPrice != null) {
    priceRange.$lte = maxPrice;
  }
  if (Object.keys(priceRange).length > 0) {
    filter.basePricePerDay = priceRange;
  }

  if (fuelType) {
    filter.fuelType = fuelType;
  }
  if (transmission) {
    filter.transmission = transmission;
  }
  if (vehicleType) {
    filter.vehicleType = vehicleType;
  }

  if (district && district.trim()) {
    const safe = district.trim();
    filter["location.district"] = { $regex: new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") };
  }

  if (q && q.trim()) {
    const terms = q.trim();
    const rx = new RegExp(terms.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { brand: rx }, { model: rx }, { description: rx }];
  }

  const skip = (page - 1) * limit;
  let sortDef = { createdAt: -1 };
  if (sort === "price_asc") {
    sortDef = { basePricePerDay: 1 };
  } else if (sort === "price_desc") {
    sortDef = { basePricePerDay: -1 };
  } else {
    sortDef = { createdAt: -1 };
  }

  const [items, total] = await Promise.all([
    Car.find(filter)
      .sort(sortDef)
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name")
      .lean()
      .exec(),
    Car.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

async function getPublicCarById(id) {
  ensureValidObjectId(id, "car id");
  const car = await Car.findOne({
    _id: id,
    status: "active",
    "verification.status": "verified",
    isDeleted: { $ne: true },
  })
    .populate("ownerId", "name")
    .lean()
    .exec();

  if (!car) {
    const err = new Error("Car not found");
    err.status = 404;
    throw err;
  }

  return car;
}

module.exports = {
  MODERATION_ACTIONS,
  createCar,
  listOwnerCars,
  getOwnerCarById,
  updateOwnerCar,
  deleteOwnerCar,
  restoreOwnerCar,
  listPendingModerationCars,
  moderateCar,
  listPublicCars,
  getPublicCarById,
};
