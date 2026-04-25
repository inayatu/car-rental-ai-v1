const {
  createPresignSchema,
  markUploadedSchema,
  cleanupUploadsSchema,
} = require("./upload.validation");
const uploadService = require("./upload.service");

function sanitizeUpload(upload) {
  return {
    id: upload._id,
    ownerId: upload.ownerId,
    uploadSessionId: upload.uploadSessionId,
    fileKey: upload.fileKey,
    fileName: upload.fileName,
    contentType: upload.contentType,
    fileCategory: upload.fileCategory,
    fileUrl: upload.fileUrl,
    status: upload.status,
    uploadedAt: upload.uploadedAt,
    linkedAt: upload.linkedAt,
    expiresAt: upload.expiresAt,
    carId: upload.carId,
    createdAt: upload.createdAt,
    updatedAt: upload.updatedAt,
  };
}

async function createPresign(req, res, next) {
  try {
    const payload = createPresignSchema.parse(req.body);
    const result = await uploadService.createPresignedUpload(req.user.sub, payload);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function markUploaded(req, res, next) {
  try {
    const payload = markUploadedSchema.parse(req.body);
    const upload = await uploadService.markUploaded(req.user.sub, payload);
    return res.status(200).json({ upload: sanitizeUpload(upload) });
  } catch (error) {
    return next(error);
  }
}

async function listMyUploads(req, res, next) {
  try {
    const status =
      typeof req.query.status === "string" && req.query.status.trim().length > 0
        ? req.query.status.trim()
        : undefined;
    const uploads = await uploadService.listOwnerUploads(req.user.sub, status);
    return res.status(200).json({ uploads: uploads.map(sanitizeUpload) });
  } catch (error) {
    return next(error);
  }
}

async function cleanupExpired(req, res, next) {
  try {
    const parsed = cleanupUploadsSchema.parse(req.body || {});
    const result = await uploadService.cleanupExpiredUploads(parsed.limit);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPresign,
  markUploaded,
  listMyUploads,
  cleanupExpired,
};
