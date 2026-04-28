const express = require("express");
const authController = require("./auth.controller");
const {
  authBurstLimiter,
  loginBruteforceLimiter,
  refreshLimiter,
  registerLimiter,
} = require("../../middlewares/rate-limit.middleware");

const router = express.Router();

router.get("/me", authController.getMe);
router.post("/register", authBurstLimiter, registerLimiter, authController.register);
router.post("/login", authBurstLimiter, loginBruteforceLimiter, authController.login);
router.post("/refresh", authBurstLimiter, refreshLimiter, authController.refresh);
router.post("/logout", authBurstLimiter, authController.logout);

module.exports = router;
