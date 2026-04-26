const User = require("../users/user.model");
const {
  registerSchema,
  loginSchema,
  refreshBodySchema,
  logoutBodySchema,
} = require("./auth.validation");
const authService = require("./auth.service");
const { verifyAccessToken } = require("../../utils/jwt");
const {
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
} = require("./auth.cookies");

function sanitizeUser(user) {
  return {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getMe(req, res) {
  try {
    const access = getAccessTokenFromRequest(req);
    if (access) {
      try {
        const payload = verifyAccessToken(access);
        const user = await User.findById(payload.sub);
        if (user) {
          return res.status(200).json({ user: sanitizeUser(user) });
        }
      } catch {
        // fall through: try refresh
      }
    }

    const refresh = getRefreshTokenFromRequest(req);
    if (refresh) {
      try {
        const result = await authService.refresh({ refreshToken: refresh });
        setAuthCookies(res, result.accessToken, result.refreshToken);
        return res.status(200).json({ user: sanitizeUser(result.user) });
      } catch {
        clearAuthCookies(res);
        return res.status(200).json({ user: null });
      }
    }

    return res.status(200).json({ user: null });
  } catch (error) {
    return res.status(200).json({ user: null });
  }
}

async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(201).json({
      user: sanitizeUser(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      user: sanitizeUser(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    refreshBodySchema.parse(req.body);
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token" });
    }

    const result = await authService.refresh({ refreshToken });
    setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      user: sanitizeUser(result.user),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    logoutBodySchema.parse(req.body);
    const refreshToken = getRefreshTokenFromRequest(req);

    clearAuthCookies(res);

    if (refreshToken) {
      const result = await authService.logout({ refreshToken });
      return res.status(200).json(result);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMe,
  register,
  login,
  refresh,
  logout,
};
