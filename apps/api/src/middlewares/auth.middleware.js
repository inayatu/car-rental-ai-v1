const { verifyAccessToken } = require("../utils/jwt");
const { Messages } = require("../constants/errorMessages");
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
          return res.status(401).json({ message: Messages.http.notAuthenticated });
        }
        try {
          const result = await authService.refresh({ refreshToken });
          setAuthCookies(res, result.accessToken, result.refreshToken);
          payload = verifyAccessToken(result.accessToken);
        } catch {
          return res.status(401).json({ message: Messages.http.notAuthenticated });
        }
      }

      req.user = payload;

      if (roles.length > 0 && !roles.includes(payload.role)) {
        return res.status(403).json({ message: Messages.http.forbidden });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: Messages.http.invalidOrExpiredToken });
    }
  };
}

module.exports = { requireAuth };
