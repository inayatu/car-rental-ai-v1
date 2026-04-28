const rateLimit = require("express-rate-limit");
const { Messages } = require("../constants/errorMessages");

function normalizeIdentity(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function byIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function byIpAndCredential(req) {
  const ip = byIp(req);
  const loginId = normalizeIdentity(req.body?.emailOrPhone || req.body?.email || "");
  return loginId ? `${ip}:${loginId}` : ip;
}

function byUserOrIp(req) {
  const uid = normalizeIdentity(req.user?.sub || "");
  if (uid) return `u:${uid}`;
  return byIp(req);
}

function createLimiter({ windowMs, max, keyGenerator, skipSuccessfulRequests = false, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator,
    skipSuccessfulRequests,
    message: {
      message: message || Messages.rateLimit.default,
    },
  });
}

const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  keyGenerator: byIp,
  message: Messages.rateLimit.api,
});

const authBurstLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: byIp,
  message: Messages.rateLimit.authBurst,
});

const loginBruteforceLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: byIpAndCredential,
  skipSuccessfulRequests: true,
  message: Messages.rateLimit.loginBruteforce,
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: byIp,
  message: Messages.rateLimit.register,
});

const refreshLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  keyGenerator: byIp,
  message: Messages.rateLimit.refresh,
});

const bookingMutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyGenerator: byUserOrIp,
  message: Messages.rateLimit.bookingMutation,
});

const ownerCarMutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: byUserOrIp,
  message: Messages.rateLimit.ownerCarMutation,
});

const moderationMutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: byUserOrIp,
  message: Messages.rateLimit.moderationMutation,
});

module.exports = {
  globalApiLimiter,
  authBurstLimiter,
  loginBruteforceLimiter,
  registerLimiter,
  refreshLimiter,
  bookingMutationLimiter,
  ownerCarMutationLimiter,
  moderationMutationLimiter,
};
