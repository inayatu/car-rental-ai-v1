const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");
const env = require("../config/env");

const tempDir = path.join(process.cwd(), env.uploads.dir, "tmp");
fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || "";
    const safeExtension = extension.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
    cb(null, `${Date.now()}-${randomUUID()}${safeExtension}`);
  },
});

const uploadSingle = multer({
  storage,
  limits: {
    fileSize: env.uploads.maxSizeMb * 1024 * 1024,
  },
});

module.exports = { uploadSingle };
