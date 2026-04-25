const { verifyAccessToken } = require("../utils/jwt");

function requireAuth(roles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        return res
          .status(401)
          .json({ message: "Missing or invalid Authorization header" });
      }

      const payload = verifyAccessToken(token);
      req.user = payload;

      if (roles.length > 0 && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return next();
    } catch (_error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = { requireAuth };
