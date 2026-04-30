const User = require("../users/user.model");
const {
  registerSchema,
  loginSchema,
  refreshBodySchema,
  logoutBodySchema,
  profilePatchSchema,
} = require("./auth.validation");
const authService = require("./auth.service");
const { processUserIdentityImage } = require("../users/user-identity.service");
const { verifyAccessToken } = require("../../utils/jwt");
const {
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
} = require("./auth.cookies");
const { Messages } = require("../../constants/errorMessages");

function sanitizeUser(user) {
  return {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    verificationStatus: user.verificationStatus,
    selfieUrl: user.selfieUrl || null,
    cnicImageUrl: user.cnicImageUrl || null,
    identitySubmittedAt: user.identitySubmittedAt || null,
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
      return res.status(400).json({ message: Messages.auth.missingRefreshToken });
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

async function patchProfile(req, res, next) {
  try {
    const body = profilePatchSchema.parse(req.body || {});
    const user = await User.findById(req.user.sub);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (user.verificationStatus === "verified") {
      const err = new Error(Messages.profile.verifiedReadOnly);
      err.status = 403;
      throw err;
    }
    if (body.email && body.email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: body.email.toLowerCase(), _id: { $ne: user._id } });
      if (taken) {
        const err = new Error(Messages.profile.emailInUse);
        err.status = 409;
        throw err;
      }
      user.email = body.email.toLowerCase();
    }
    if (body.phone && body.phone.trim() !== user.phone) {
      const taken = await User.findOne({ phone: body.phone.trim(), _id: { $ne: user._id } });
      if (taken) {
        const err = new Error(Messages.profile.phoneInUse);
        err.status = 409;
        throw err;
      }
      user.phone = body.phone.trim();
    }
    if (body.name) user.name = body.name.trim();
    await user.save();
    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function uploadProfileIdentity(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (user.verificationStatus === "verified") {
      const err = new Error(Messages.profile.identityVerifiedLocked);
      err.status = 403;
      throw err;
    }
    const selfie = req.files?.selfie?.[0];
    const cnic = req.files?.cnic?.[0];
    if (!selfie || !cnic) {
      const err = new Error(Messages.profile.identityRequiresBothImages);
      err.status = 400;
      throw err;
    }
    const selfieUrl = await processUserIdentityImage(selfie);
    const cnicImageUrl = await processUserIdentityImage(cnic);
    user.selfieUrl = selfieUrl;
    user.cnicImageUrl = cnicImageUrl;
    user.identitySubmittedAt = new Date();
    if (user.verificationStatus === "pending" || user.verificationStatus === "rejected") {
      user.verificationStatus = "under_review";
    }
    await user.save();
    return res.status(200).json({ user: sanitizeUser(user) });
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
  patchProfile,
  uploadProfileIdentity,
  logout,
};
