const mongoose = require("mongoose");
const Car = require("./car.model");
const User = require("../users/user.model");
const { Messages, invalidField } = require("../../constants/errorMessages");

const MODERATION_ACTIONS = {
  VERIFY: "verify",
  UNVERIFY: "unverify",
  BLACKLIST: "blacklist",
  UNBLACKLIST: "unblacklist",
};

function ensureValidObjectId(id, fieldName = "id") {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error(invalidField(fieldName));
    err.status = 400;
    throw err;
  }
}

function assertOwnerListingNotBlacklisted(car) {
  if (car.verification?.status === "blacklisted") {
    const err = new Error(Messages.car.listingBlacklistedOwnerLocked);
    err.status = 403;
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
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
  const skip = (page - 1) * limit;
  const removedOnly = options.removedOnly === true || options.removedOnly === "1";

  const filter = { ownerId };
  if (removedOnly) {
    filter.isDeleted = true;
  } else {
    filter.isDeleted = { $ne: true };
  }

  const [items, total, activeListedCount] = await Promise.all([
    Car.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    Car.countDocuments(filter),
    removedOnly
      ? Promise.resolve(0)
      : Car.countDocuments({ ownerId, isDeleted: { $ne: true }, status: "active" }),
  ]);

  return { items, total, page, limit, activeListedCount };
}

async function getOwnerCarById(ownerId, carId) {
  ensureValidObjectId(carId, "car id");
  const car = await Car.findOne({ _id: carId, ownerId });

  if (!car) {
    const err = new Error(Messages.car.notFound);
    err.status = 404;
    throw err;
  }

  return car;
}

function buildVerifiedOwnerUpdatePayload(car, updates) {
  const payload = {};
  if (updates.basePricePerDay !== undefined) {
    payload.basePricePerDay = updates.basePricePerDay;
  }
  if (updates.currency !== undefined) {
    payload.currency = updates.currency;
  }
  if (updates.status !== undefined) {
    payload.status = updates.status;
  }
  const hasLocationKeys =
    updates.location !== undefined ||
    updates.district !== undefined ||
    updates.city !== undefined;
  if (hasLocationKeys) {
    const districtRaw =
      updates.location != null && typeof updates.location === "object"
        ? updates.location.district
        : updates.district;
    const district =
      districtRaw !== undefined && districtRaw !== null
        ? String(districtRaw).trim()
        : String(car.location?.district || "").trim();
    payload.location = {
      district,
      city: car.location?.city,
    };
  }
  return payload;
}

async function updateOwnerCar(ownerId, carId, updates) {
  ensureValidObjectId(carId, "car id");

  const car = await Car.findOne({ _id: carId, ownerId });

  if (!car) {
    const err = new Error(Messages.car.notFound);
    err.status = 404;
    throw err;
  }
  if (car.isDeleted) {
    const err = new Error(Messages.car.listingRemovedRestoreFirst);
    err.status = 400;
    throw err;
  }

  assertOwnerListingNotBlacklisted(car);

  const isVerified = car.verification?.status === "verified";

  let payload;
  if (isVerified) {
    const uploadedImages = Array.isArray(updates.images) ? updates.images.length : 0;
    const uploadedDocs = Array.isArray(updates.documents) ? updates.documents.length : 0;
    if (uploadedImages > 0 || uploadedDocs > 0) {
      const err = new Error(Messages.car.verifiedListingNoDocChanges);
      err.status = 400;
      throw err;
    }
    payload = buildVerifiedOwnerUpdatePayload(car, updates);
  } else {
    payload = { ...updates };
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

  const car = await Car.findOne({ _id: carId, ownerId, isDeleted: { $ne: true } });
  if (!car) {
    const err = new Error(Messages.car.notFoundOrAlreadyRemoved);
    err.status = 404;
    throw err;
  }

  assertOwnerListingNotBlacklisted(car);

  car.isDeleted = true;
  car.deletedAt = new Date();
  await car.save();

  return { success: true, soft: true, car };
}

async function restoreOwnerCar(ownerId, carId) {
  ensureValidObjectId(carId, "car id");

  const car = await Car.findOne({ _id: carId, ownerId, isDeleted: true });
  if (!car) {
    const err = new Error(Messages.car.notFoundOrNotRemoved);
    err.status = 404;
    throw err;
  }

  assertOwnerListingNotBlacklisted(car);

  car.isDeleted = false;
  car.deletedAt = null;
  await car.save();

  return car;
}

async function listPendingModerationCars(options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 50));
  const skip = (page - 1) * limit;

  const filter = {
    "verification.status": { $in: ["pending", "unverified"] },
    isDeleted: { $ne: true },
  };

  const [items, total] = await Promise.all([
    Car.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name email phone"),
    Car.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

async function moderateCar(carId, moderatorId, moderatorRole, action, payload = {}) {
  ensureValidObjectId(carId, "car id");
  ensureValidObjectId(moderatorId, "moderator id");

  if (!Object.values(MODERATION_ACTIONS).includes(action)) {
    const err = new Error(Messages.car.invalidModerationAction);
    err.status = 400;
    throw err;
  }

  const car = await Car.findById(carId);
  if (!car) {
    const err = new Error(Messages.car.notFound);
    err.status = 404;
    throw err;
  }
  if (car.isDeleted) {
    const err = new Error(Messages.car.listingNoLongerActive);
    err.status = 404;
    throw err;
  }

  const now = new Date();
  const reason = payload.reason || payload.notes;

  if (
    (action === MODERATION_ACTIONS.UNVERIFY ||
      action === MODERATION_ACTIONS.BLACKLIST ||
      action === MODERATION_ACTIONS.UNBLACKLIST) &&
    !reason
  ) {
    const err = new Error(Messages.car.reasonRequiredUnverifyBlacklist);
    err.status = 400;
    throw err;
  }

  if (action === MODERATION_ACTIONS.UNBLACKLIST) {
    if (car.verification?.status !== "blacklisted") {
      const err = new Error(Messages.car.notBlacklisted);
      err.status = 400;
      throw err;
    }
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

  if (action === MODERATION_ACTIONS.UNBLACKLIST) {
    car.verification.status = "verified";
    car.verification.verifiedBadge = true;
    car.verification.verifiedAt = now;
    car.verification.verifiedBy = moderatorId;
    car.verification.notes = payload.notes || reason || "Blacklist removed by moderator; listing restored.";
    car.status = "active";
  }

  car.verification.lastActionAt = now;
  car.verification.lastActionBy = moderatorId;
  car.verification.lastActionByRole = moderatorRole;

  const historyActionMap = {
    [MODERATION_ACTIONS.VERIFY]: "verified",
    [MODERATION_ACTIONS.UNVERIFY]: "unverified",
    [MODERATION_ACTIONS.BLACKLIST]: "blacklisted",
    [MODERATION_ACTIONS.UNBLACKLIST]: "unblacklisted",
  };
  const historyAction = historyActionMap[action];

  car.moderationHistory.push({
    action: historyAction,
    by: moderatorId,
    byRole: moderatorRole,
    reason,
    at: now,
  });

  await car.save();
  return car;
}

async function listAllCarsAdmin(options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 50));
  const skip = (page - 1) * limit;

  const filter = {};
  const [items, total] = await Promise.all([
    Car.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name email phone")
      .lean()
      .exec(),
    Car.countDocuments(filter),
  ]);

  return { items, total, page, limit };
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

  /** Visible on marketplace: verified & active, or admin-blacklisted (still listed, not bookable). */
  const visibility = {
    $or: [
      { status: "active", "verification.status": "verified" },
      { "verification.status": "blacklisted" },
    ],
    isDeleted: { $ne: true },
  };

  const filter = { $and: [visibility] };

  const priceRange = {};
  if (minPrice != null) {
    priceRange.$gte = minPrice;
  }
  if (maxPrice != null) {
    priceRange.$lte = maxPrice;
  }
  if (Object.keys(priceRange).length > 0) {
    filter.$and.push({ basePricePerDay: priceRange });
  }

  if (fuelType) {
    filter.$and.push({ fuelType });
  }
  if (transmission) {
    filter.$and.push({ transmission });
  }
  if (vehicleType) {
    filter.$and.push({ vehicleType });
  }

  if (district && district.trim()) {
    const safe = district.trim();
    filter.$and.push({
      "location.district": { $regex: new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
    });
  }

  if (q && q.trim()) {
    const terms = q.trim();
    const rx = new RegExp(terms.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$and.push({
      $or: [{ title: rx }, { brand: rx }, { model: rx }, { description: rx }],
    });
  }

  const verifiedOwnerIds = await User.find({
    role: "owner",
    verificationStatus: "verified",
  }).distinct("_id");
  filter.$and.push({ ownerId: { $in: verifiedOwnerIds } });

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
    isDeleted: { $ne: true },
    $or: [
      { status: "active", "verification.status": "verified" },
      { "verification.status": "blacklisted" },
    ],
  })
    .populate("ownerId", "name role verificationStatus")
    .lean()
    .exec();

  if (!car) {
    const err = new Error(Messages.car.notFound);
    err.status = 404;
    throw err;
  }

  const owner = car.ownerId;
  if (
    owner &&
    typeof owner === "object" &&
    owner.role === "owner" &&
    owner.verificationStatus !== "verified"
  ) {
    const err = new Error(Messages.car.notFound);
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
  listAllCarsAdmin,
  listPublicCars,
  getPublicCarById,
};
