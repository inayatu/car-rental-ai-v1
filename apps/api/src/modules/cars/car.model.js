const mongoose = require("mongoose");

const carDocumentSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    number: { type: String, trim: true },
    issuedBy: { type: String, trim: true },
    expiresAt: { type: Date },
  },
  { _id: false }
);

const moderationEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["submitted", "verified", "unverified", "blacklisted", "unblacklisted"],
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    byRole: {
      type: String,
      enum: ["owner", "admin", "govt_staff"],
      required: true,
    },
    reason: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const carSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980 },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    color: { type: String, trim: true },
    seats: { type: Number, min: 1, default: 4 },
    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "hybrid", "electric"],
      default: "petrol",
    },
    /** For search filters: SUV, sedan, pickup, etc. */
    vehicleType: {
      type: String,
      enum: ["suv_4wd", "jeep", "sedan", "van_coaster", "pickup", "other"],
      default: "other",
      index: true,
    },
    basePricePerDay: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR", trim: true, uppercase: true },
    location: {
      district: { type: String, required: true, trim: true },
      city: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused"],
      default: "draft",
      index: true,
    },
    /** Soft delete: when true, listing is hidden from owner "active" list and from public search. */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: { type: Date, default: null },
    description: { type: String, trim: true },
    images: [{ type: String }],
    documents: [carDocumentSchema],
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "unverified", "blacklisted"],
        default: "pending",
        index: true,
      },
      verifiedBadge: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: { type: String, trim: true },
      lastActionAt: { type: Date, default: Date.now },
      lastActionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      lastActionByRole: {
        type: String,
        enum: ["owner", "admin", "govt_staff"],
      },
    },
    moderationHistory: [moderationEventSchema],
  },
  { timestamps: true }
);

/** API/service verbs stored by mistake — normalize before enum validation on save. */
const MODERATION_ACTION_ALIASES = {
  blacklist: "blacklisted",
  unblacklist: "unblacklisted",
  verify: "verified",
  unverify: "unverified",
};

carSchema.pre("validate", function normalizeModerationHistoryActions() {
  const hist = this.moderationHistory;
  if (!Array.isArray(hist) || hist.length === 0) return;
  for (const ev of hist) {
    if (ev && typeof ev.action === "string") {
      const mapped = MODERATION_ACTION_ALIASES[ev.action];
      if (mapped) ev.action = mapped;
    }
  }
});

carSchema.index({ ownerId: 1, status: 1, "location.district": 1 });
carSchema.index({ "verification.status": 1, createdAt: -1 });
carSchema.index({ registrationNumber: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Car", carSchema);
