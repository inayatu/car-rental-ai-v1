const { verifyAccessToken } = require("../utils/jwt");
const authService = require("../modules/auth/auth.service");
const {
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  setAuthCookies,
} = require("../modules/auth/auth.cookies");

function requireAuth(roles = []) {
  return async (req, res, next) => {
    try {
      const token = getAccessTokenFromRequest(req);
      let payload = null;

      if (token) {
        try {
          payload = verifyAccessToken(token);
        } catch {
          /* access expired or invalid */
        }
      }

      if (!payload) {
        const refreshToken = getRefreshTokenFromRequest(req);
        if (!refreshToken) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        try {
          const result = await authService.refresh({ refreshToken });
          setAuthCookies(res, result.accessToken, result.refreshToken);
          payload = verifyAccessToken(result.accessToken);
        } catch {
          return res.status(401).json({ message: "Not authenticated" });
        }
      }

      req.user = payload;

      if (roles.length > 0 && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = { requireAuth };
