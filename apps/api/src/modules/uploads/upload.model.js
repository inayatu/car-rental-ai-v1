const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploadSessionId: { type: String, required: true, index: true },
    fileKey: { type: String, required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    contentType: { type: String, required: true, trim: true },
    fileCategory: {
      type: String,
      enum: ["image", "document"],
      required: true,
      index: true,
    },
    fileUrl: { type: String, required: true, trim: true, index: true },
    uploadUrl: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "uploaded", "linked", "expired", "deleted"],
      default: "pending",
      index: true,
    },
    uploadedAt: { type: Date },
    linkedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", index: true },
    sizeBytes: { type: Number, min: 0 },
  },
  { timestamps: true }
);

uploadSchema.index({ ownerId: 1, status: 1, expiresAt: 1 });
uploadSchema.index({ ownerId: 1, fileUrl: 1 }, { unique: true });

module.exports = mongoose.model("Upload", uploadSchema);
