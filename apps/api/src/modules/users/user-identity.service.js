const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { randomUUID } = require("crypto");
const env = require("../../config/env");
const { Messages } = require("../../constants/errorMessages");

/** Normalized type for validation (some clients send image/jpg). */
const RASTER_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const COPY_AS_IS_TYPES = new Set(["image/heic", "image/heif"]);

const rootUploadsDir = path.join(process.cwd(), env.uploads.dir);
const userIdentityDir = path.join(rootUploadsDir, "users", "identity");

fs.mkdirSync(userIdentityDir, { recursive: true });

function normalizePublicUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return `${env.uploads.publicBasePath}/${normalized}`.replace(/\/{2,}/g, "/");
}

function normalizeMime(mimetype) {
  if (mimetype === "image/jpg") return "image/jpeg";
  return mimetype;
}

/**
 * Resize and store a profile identity image; returns public URL path.
 * @param {import("multer").File} file
 */
async function processUserIdentityImage(file) {
  const mt = normalizeMime(file.mimetype);

  if (COPY_AS_IS_TYPES.has(mt)) {
    const ext = mt === "image/heif" ? ".heif" : ".heic";
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const relativePath = path.join("users", "identity", filename);
    const targetPath = path.join(rootUploadsDir, relativePath);
    try {
      fs.copyFileSync(file.path, targetPath);
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* temp already removed */
      }
    }
    return normalizePublicUrl(relativePath);
  }

  if (!RASTER_TYPES.has(mt)) {
    const err = new Error(Messages.upload.unsupportedImageType(file.mimetype));
    err.status = 400;
    throw err;
  }

  const filename = `${Date.now()}-${randomUUID()}.jpg`;
  const relativePath = path.join("users", "identity", filename);
  const targetPath = path.join(rootUploadsDir, relativePath);

  try {
    await sharp(file.path)
      .rotate()
      .resize({
        width: env.uploads.imageMaxWidth,
        withoutEnlargement: true,
      })
      .jpeg({
        quality: env.uploads.imageQuality,
        mozjpeg: true,
      })
      .toFile(targetPath);
  } catch (e) {
    const err = new Error(
      e?.message ? `Could not process image: ${e.message}` : "Could not process image. Try JPEG or PNG."
    );
    err.status = 400;
    throw err;
  } finally {
    try {
      fs.unlinkSync(file.path);
    } catch {
      /* already removed */
    }
  }

  return normalizePublicUrl(relativePath);
}

module.exports = {
  processUserIdentityImage,
};
