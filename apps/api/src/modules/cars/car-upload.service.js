const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { randomUUID } = require("crypto");
const env = require("../../config/env");
const { Messages } = require("../../constants/errorMessages");

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set(["application/pdf"]);

const rootUploadsDir = path.join(process.cwd(), env.uploads.dir);
const carImagesDir = path.join(rootUploadsDir, "cars", "images");
const carDocumentsDir = path.join(rootUploadsDir, "cars", "documents");

fs.mkdirSync(carImagesDir, { recursive: true });
fs.mkdirSync(carDocumentsDir, { recursive: true });

function normalizePublicUrl(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return `${env.uploads.publicBasePath}/${normalized}`.replace(/\/{2,}/g, "/");
}

function parseDocumentTypes(documentTypesRaw) {
  if (!documentTypesRaw) {
    return [];
  }

  if (Array.isArray(documentTypesRaw)) {
    return documentTypesRaw.map((value) => String(value).trim()).filter(Boolean);
  }

  if (typeof documentTypesRaw !== "string") {
    return [];
  }

  const value = documentTypesRaw.trim();
  if (!value) {
    return [];
  }

  if (value.startsWith("[") || value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.map((item) => String(item).trim()).filter(Boolean)
        : [];
    } catch (_error) {
      return [];
    }
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function processImage(file) {
  if (!IMAGE_TYPES.has(file.mimetype)) {
    const err = new Error(Messages.upload.unsupportedImageType(file.mimetype));
    err.status = 400;
    throw err;
  }

  const filename = `${Date.now()}-${randomUUID()}.jpg`;
  const relativePath = path.join("cars", "images", filename);
  const targetPath = path.join(rootUploadsDir, relativePath);

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

  fs.unlinkSync(file.path);

  return normalizePublicUrl(relativePath);
}

function processDocument(file, docType) {
  if (!DOCUMENT_TYPES.has(file.mimetype)) {
    const err = new Error(Messages.upload.unsupportedDocumentType(file.mimetype));
    err.status = 400;
    throw err;
  }

  const filename = `${Date.now()}-${randomUUID()}.pdf`;
  const relativePath = path.join("cars", "documents", filename);
  const targetPath = path.join(rootUploadsDir, relativePath);
  fs.copyFileSync(file.path, targetPath);
  fs.unlinkSync(file.path);

  return {
    docType: docType || "supporting_document",
    url: normalizePublicUrl(relativePath),
  };
}

const MAX_CAR_IMAGES = 5;

async function processCarUploads(files, documentTypesRaw) {
  const imageFiles = (Array.isArray(files?.images) ? files.images : []).slice(0, MAX_CAR_IMAGES);
  const documentFiles = Array.isArray(files?.documents) ? files.documents : [];
  const documentTypes = parseDocumentTypes(documentTypesRaw);

  const imageUrls = [];
  for (const file of imageFiles) {
    // Sequential processing keeps memory pressure predictable.
    // eslint-disable-next-line no-await-in-loop
    imageUrls.push(await processImage(file));
  }

  const documents = documentFiles.map((file, index) =>
    processDocument(file, documentTypes[index])
  );

  return { imageUrls, documents };
}

module.exports = {
  processCarUploads,
};
