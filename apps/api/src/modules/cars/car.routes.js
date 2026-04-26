const express = require("express");
const { requireAuth } = require("../../middlewares/auth.middleware");
const carController = require("./car.controller");
const { uploadSingle } = require("../../middlewares/upload.middleware");

const router = express.Router();

router.get("/", carController.listPublicCars);
router.get("/public/:id", carController.getPublicCarById);

router.post(
  "/",
  requireAuth(["owner"]),
  uploadSingle.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  carController.createCar
);
router.get("/mine", requireAuth(["owner"]), carController.listMyCars);

router.get(
  "/moderation/pending",
  requireAuth(["admin", "govt_staff"]),
  carController.listPendingModeration
);
router.post("/:id/verify", requireAuth(["admin", "govt_staff"]), carController.verifyCar);
router.post("/:id/unverify", requireAuth(["admin", "govt_staff"]), carController.unverifyCar);
router.post("/:id/blacklist", requireAuth(["admin", "govt_staff"]), carController.blacklistCar);
router.get("/:id", requireAuth(["owner"]), carController.getMyCarById);
router.patch(
  "/:id",
  requireAuth(["owner"]),
  uploadSingle.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 10 },
  ]),
  carController.updateMyCar
);
router.delete("/:id", requireAuth(["owner"]), carController.deleteMyCar);

module.exports = router;
