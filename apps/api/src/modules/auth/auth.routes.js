const express = require("express");
const authController = require("./auth.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { uploadSingle } = require("../../middlewares/upload.middleware");
const {
  authBurstLimiter,
  loginBruteforceLimiter,
  refreshLimiter,
  registerLimiter,
} = require("../../middlewares/rate-limit.middleware");

const router = express.Router();

router.get("/me", authController.getMe);
router.patch("/profile", authBurstLimiter, requireAuth(), authController.patchProfile);
router.post(
  "/profile/identity",
  authBurstLimiter,
  requireAuth(),
  uploadSingle.fields([
    { name: "selfie", maxCount: 1 },
    { name: "cnic", maxCount: 1 },
  ]),
  authController.uploadProfileIdentity
);
router.post("/register", authBurstLimiter, registerLimiter, authController.register);
router.post("/login", authBurstLimiter, loginBruteforceLimiter, authController.login);
router.post("/refresh", authBurstLimiter, refreshLimiter, authController.refresh);
router.post("/logout", authBurstLimiter, authController.logout);

module.exports = router;
