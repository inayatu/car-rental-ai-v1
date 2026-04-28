const env = require("../../config/env");

const COOKIE_ACCESS = "accessToken";
const COOKIE_REFRESH = "refreshToken";

function ttlToMs(ttl) {
  const m = /^(\d+)([smhd])$/i.exec(String(ttl).trim());
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * (mult[u] || mult.d);
}

function baseCookieOptions(maxAge) {
  const isProd = env.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(
    COOKIE_ACCESS,
    accessToken,
    baseCookieOptions(ttlToMs(env.jwt.accessTtl))
  );
  res.cookie(
    COOKIE_REFRESH,
    refreshToken,
    baseCookieOptions(ttlToMs(env.jwt.refreshTtl))
  );
}

function clearAuthCookies(res) {
  res.clearCookie(COOKIE_ACCESS, { path: "/" });
  res.clearCookie(COOKIE_REFRESH, { path: "/" });
}

function getAccessTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme === "Bearer" && token) {
    return token;
  }
  if (req.cookies && req.cookies[COOKIE_ACCESS]) {
    return req.cookies[COOKIE_ACCESS];
  }
  return null;
}

function getRefreshTokenFromRequest(req) {
  if (req.cookies && req.cookies[COOKIE_REFRESH]) {
    return req.cookies[COOKIE_REFRESH];
  }
  if (req.body && typeof req.body.refreshToken === "string" && req.body.refreshToken.length > 0) {
    return req.body.refreshToken;
  }
  return null;
}

module.exports = {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
};
