const mongoose = require("mongoose");

const bookingTimelineSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    byRole: {
      type: String,
      enum: ["renter", "owner", "admin", "govt_staff"],
      required: true,
    },
    note: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    totalDays: { type: Number, required: true, min: 1 },
    quotedAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR", trim: true, uppercase: true },
    status: {
      type: String,
      enum: ["requested", "accepted", "rejected", "cancelled", "completed"],
      default: "requested",
      index: true,
    },
    cancellationReason: { type: String, trim: true },
    timeline: [bookingTimelineSchema],
  },
  { timestamps: true }
);

bookingSchema.index({ carId: 1, startDate: 1, endDate: 1, status: 1 });
bookingSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ renterId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
