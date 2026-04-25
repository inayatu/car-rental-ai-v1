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
  const car = await Car.create({
    ...payload,
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

async function listOwnerCars(ownerId) {
  return Car.find({ ownerId }).sort({ createdAt: -1 });
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

  const deleted = await Car.findOneAndDelete({ _id: carId, ownerId });
  if (!deleted) {
    const err = new Error("Car not found");
    err.status = 404;
    throw err;
  }

  return { success: true };
}

async function listPendingModerationCars() {
  return Car.find({
    "verification.status": { $in: ["pending", "unverified"] },
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

module.exports = {
  MODERATION_ACTIONS,
  createCar,
  listOwnerCars,
  getOwnerCarById,
  updateOwnerCar,
  deleteOwnerCar,
  listPendingModerationCars,
  moderateCar,
};
