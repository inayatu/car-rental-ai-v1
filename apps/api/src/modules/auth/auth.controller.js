const {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} = require("./auth.validation");
const authService = require("./auth.service");

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

async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

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
    const input = refreshSchema.parse(req.body);
    const result = await authService.refresh(input);

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
    const input = logoutSchema.parse(req.body);
    const result = await authService.logout(input);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
};
