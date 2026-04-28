const rateLimit = require("express-rate-limit");

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
      message: message || "Too many requests. Please try again later.",
    },
  });
}

const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  keyGenerator: byIp,
  message: "Too many API requests from this IP. Please slow down.",
});

const authBurstLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: byIp,
  message: "Too many auth requests. Please try again later.",
});

const loginBruteforceLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyGenerator: byIpAndCredential,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts. Please wait before trying again.",
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: byIp,
  message: "Too many registration attempts. Please try again in an hour.",
});

const refreshLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  keyGenerator: byIp,
  message: "Too many token refresh requests. Please try again shortly.",
});

const bookingMutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  keyGenerator: byUserOrIp,
  message: "Too many booking changes. Please wait and try again.",
});

const ownerCarMutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: byUserOrIp,
  message: "Too many listing updates. Please wait and try again.",
});

const moderationMutationLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: byUserOrIp,
  message: "Too many moderation actions. Please wait and try again.",
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
