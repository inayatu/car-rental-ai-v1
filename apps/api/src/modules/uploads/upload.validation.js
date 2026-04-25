const { z } = require("zod");

const createPresignSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(3),
  fileCategory: z.enum(["image", "document"]),
});

const markUploadedSchema = z.object({
  uploadSessionId: z.string().min(8),
  fileKey: z.string().min(8),
  publicId: z.string().min(3),
  fileUrl: z.string().url(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

const cleanupUploadsSchema = z.object({
  limit: z.number().int().positive().max(1000).optional(),
});

module.exports = {
  createPresignSchema,
  markUploadedSchema,
  cleanupUploadsSchema,
};
