const path = require("path");
const { randomUUID } = require("crypto");
const { v2: cloudinary } = require("cloudinary");
const Upload = require("./upload.model");
const env = require("../../config/env");

const ALLOWED_CONTENT_TYPES = {
  image: new Set(["image/jpeg", "image/png", "image/webp"]),
  document: new Set(["application/pdf", "image/jpeg", "image/png"]),
};

cloudinary.config({
  cloud_name: env.uploads.cloudName,
  api_key: env.uploads.apiKey,
  api_secret: env.uploads.apiSecret,
});

function normalizeUrls(urls = []) {
  return [...new Set(urls.filter(Boolean).map((url) => url.trim()))];
}

function assertContentTypeAllowed(fileCategory, contentType) {
  const allowed = ALLOWED_CONTENT_TYPES[fileCategory];
  if (!allowed || !allowed.has(contentType)) {
    const err = new Error(`Unsupported content type for ${fileCategory}`);
    err.status = 400;
    throw err;
  }
}

function isSupportedFileCategory(fileCategory) {
  return fileCategory === "image" || fileCategory === "document";
}

function buildStoragePaths(fileCategory, fileName) {
  const uploadSessionId = randomUUID();
  const extension = path.extname(fileName) || "";
  const safeExt = extension.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  const basePublicId = `${fileCategory}/${uploadSessionId}${safeExt}`;
  const folder = env.uploads.folder;
  const fileKey = `${folder}/${basePublicId}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureParams = {
    folder,
    public_id: basePublicId,
    resource_type: "auto",
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    signatureParams,
    env.uploads.apiSecret
  );
  const uploadUrl = `https://api.cloudinary.com/v1_1/${env.uploads.cloudName}/auto/upload`;
  return {
    uploadSessionId,
    fileKey,
    fileUrl: cloudinary.url(fileKey, { secure: true, resource_type: "auto" }),
    uploadUrl,
    uploadFields: {
      api_key: env.uploads.apiKey,
      timestamp,
      signature,
      folder,
      public_id: basePublicId,
      resource_type: "auto",
    },
  };
}

async function createPresignedUpload(ownerId, payload) {
  const { fileName, contentType, fileCategory } = payload;
  assertContentTypeAllowed(fileCategory, contentType);

  if (!isSupportedFileCategory(fileCategory)) {
    const err = new Error("Unsupported file category");
    err.status = 400;
    throw err;
  }

  const { uploadSessionId, fileKey, fileUrl, uploadUrl, uploadFields } = buildStoragePaths(
    fileCategory,
    fileName
  );

  const expiresAt = new Date(Date.now() + env.uploads.urlTtlMinutes * 60 * 1000);

  await Upload.create({
    ownerId,
    uploadSessionId,
    fileKey,
    fileName,
    contentType,
    fileCategory,
    fileUrl,
    uploadUrl,
    expiresAt,
    status: "pending",
  });

  return {
    uploadSessionId,
    fileKey,
    fileUrl,
    uploadUrl,
    uploadFields,
    expiresAt,
  };
}

async function markUploaded(ownerId, payload) {
  const upload = await Upload.findOne({
    ownerId,
    uploadSessionId: payload.uploadSessionId,
    fileKey: payload.fileKey,
  });

  if (!upload) {
    const err = new Error("Upload session not found");
    err.status = 404;
    throw err;
  }

  if (upload.status !== "pending") {
    const err = new Error("Upload cannot be marked as uploaded in current state");
    err.status = 409;
    throw err;
  }

  if (upload.expiresAt <= new Date()) {
    upload.status = "expired";
    await upload.save();
    const err = new Error("Upload session expired");
    err.status = 410;
    throw err;
  }

  if (payload.publicId !== upload.fileKey) {
    const err = new Error("Upload publicId does not match upload session");
    err.status = 400;
    throw err;
  }

  if (!payload.fileUrl.includes(payload.publicId)) {
    const err = new Error("Uploaded file URL does not match expected Cloudinary publicId");
    err.status = 400;
    throw err;
  }

  upload.status = "uploaded";
  upload.uploadedAt = new Date();
  upload.fileUrl = payload.fileUrl;
  if (typeof payload.sizeBytes === "number") {
    upload.sizeBytes = payload.sizeBytes;
  }
  await upload.save();

  return upload;
}

async function listOwnerUploads(ownerId, status) {
  const query = { ownerId };
  if (status) {
    query.status = status;
  }

  return Upload.find(query).sort({ createdAt: -1 }).limit(200);
}

async function assertUploadUrlsReady(ownerId, urls, options = {}) {
  const { allowLinked = false } = options;
  const normalized = normalizeUrls(urls);
  if (normalized.length === 0) {
    return [];
  }

  const allowedStatuses = allowLinked ? ["uploaded", "linked"] : ["uploaded"];
  const uploads = await Upload.find({
    ownerId,
    fileUrl: { $in: normalized },
    status: { $in: allowedStatuses },
  });

  if (uploads.length !== normalized.length) {
    const err = new Error(
      "Some file URLs are invalid, expired, or not uploaded yet. Complete upload flow first."
    );
    err.status = 400;
    throw err;
  }

  const now = new Date();
  const hasExpired = uploads.some((upload) => upload.expiresAt <= now);
  if (hasExpired) {
    const err = new Error("Some uploads are expired. Re-upload and retry.");
    err.status = 410;
    throw err;
  }

  return uploads;
}

async function linkUploadUrlsToCar(ownerId, urls, carId) {
  const normalized = normalizeUrls(urls);
  if (normalized.length === 0) {
    return;
  }

  await Upload.updateMany(
    {
      ownerId,
      fileUrl: { $in: normalized },
      status: "uploaded",
    },
    {
      $set: {
        status: "linked",
        linkedAt: new Date(),
        carId,
      },
    }
  );
}

async function cleanupExpiredUploads(limit = 500) {
  const now = new Date();
  const expired = await Upload.find({
    status: { $in: ["pending", "uploaded"] },
    expiresAt: { $lte: now },
  })
    .sort({ expiresAt: 1 })
    .limit(limit);

  if (expired.length === 0) {
    return { processed: 0, fileKeys: [] };
  }

  const ids = expired.map((item) => item._id);
  await Promise.all(
    expired.map(async (item) => {
      try {
        const resourceType = item.fileCategory === "image" ? "image" : "raw";
        await cloudinary.uploader.destroy(item.fileKey, { resource_type: resourceType });
      } catch (_error) {
        return null;
      }

      return null;
    })
  );

  await Upload.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: "expired",
      },
    }
  );

  return {
    processed: expired.length,
    fileKeys: expired.map((item) => item.fileKey),
  };
}

module.exports = {
  createPresignedUpload,
  markUploaded,
  listOwnerUploads,
  assertUploadUrlsReady,
  linkUploadUrlsToCar,
  cleanupExpiredUploads,
};
