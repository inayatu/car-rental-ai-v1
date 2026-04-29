const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const carController = require("./car.controller");
const { uploadSingle } = require("../../middlewares/upload.middleware");
const {
  moderationMutationLimiter,
  ownerCarMutationLimiter,
} = require("../../middlewares/rate-limit.middleware");

const router = express.Router();

router.get("/", carController.listPublicCars);
router.get("/public/:id", carController.getPublicCarById);

router.post(
  "/",
  requireAuth(["owner"]),
  ownerCarMutationLimiter,
  uploadSingle.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 10 },
  ]),
  carController.createCar
);
router.get("/mine", requireAuth(["owner"]), carController.listMyCars);

router.get("/admin/all", requireAuth(["admin", "govt_staff"]), carController.listAllCarsAdmin);

router.get(
  "/moderation/pending",
  requireAuth(["admin", "govt_staff"]),
  carController.listPendingModeration
);
router.post(
  "/:id/verify",
  requireAuth(["admin", "govt_staff"]),
  moderationMutationLimiter,
  carController.verifyCar
);
router.post(
  "/:id/unverify",
  requireAuth(["admin", "govt_staff"]),
  moderationMutationLimiter,
  carController.unverifyCar
);
router.post(
  "/:id/blacklist",
  requireAuth(["admin", "govt_staff"]),
  moderationMutationLimiter,
  carController.blacklistCar
);
router.post(
  "/:id/unblacklist",
  requireAuth(["admin", "govt_staff"]),
  moderationMutationLimiter,
  carController.unblacklistCar
);
router.get("/:id", requireAuth(["owner"]), carController.getMyCarById);
router.patch(
  "/:id",
  requireAuth(["owner"]),
  ownerCarMutationLimiter,
  uploadSingle.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 10 },
  ]),
  carController.updateMyCar
);
router.post("/:id/restore", requireAuth(["owner"]), ownerCarMutationLimiter, carController.restoreMyCar);
router.delete("/:id", requireAuth(["owner"]), ownerCarMutationLimiter, carController.deleteMyCar);

module.exports = router;
