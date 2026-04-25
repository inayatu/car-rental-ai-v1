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
      enum: ["submitted", "verified", "unverified", "blacklisted"],
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
    title: { type: String, required: true, trim: true },
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

carSchema.index({ ownerId: 1, status: 1, "location.district": 1 });
carSchema.index({ "verification.status": 1, createdAt: -1 });
carSchema.index({ registrationNumber: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Car", carSchema);
