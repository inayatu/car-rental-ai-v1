const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const uploadController = require("./upload.controller");

const router = express.Router();

router.post(
  "/presign",
  requireAuth(["owner"]),
  uploadController.createPresign
);
router.post(
  "/mark-uploaded",
  requireAuth(["owner"]),
  uploadController.markUploaded
);
router.get("/mine", requireAuth(["owner"]), uploadController.listMyUploads);
router.post(
  "/cleanup-expired",
  requireAuth(["admin", "govt_staff"]),
  uploadController.cleanupExpired
);

module.exports = router;
