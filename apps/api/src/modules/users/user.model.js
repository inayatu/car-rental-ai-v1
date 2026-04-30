const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["renter", "owner", "admin", "govt_staff"],
      default: "renter",
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "under_review", "verified", "rejected"],
      default: "pending",
    },
    /** Public URL path e.g. /uploads/users/identity/... */
    selfieUrl: { type: String, trim: true },
    cnicImageUrl: { type: String, trim: true },
    identitySubmittedAt: { type: Date },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.index({ role: 1, verificationStatus: 1 });

module.exports = mongoose.model("User", userSchema);
