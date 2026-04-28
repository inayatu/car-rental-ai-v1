const bcrypt = require("bcryptjs");
const User = require("../users/user.model");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");
const { Messages } = require("../../constants/errorMessages");

const SELF_REGISTER_ALLOWED_ROLES = new Set(["renter", "owner"]);

function buildAuthResponse(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken };
}

async function register(input) {
  const { name, email, phone, password, role } = input;
  const userRole = role || "renter";

  if (!SELF_REGISTER_ALLOWED_ROLES.has(userRole)) {
    const err = new Error(Messages.auth.invalidRoleSelfRegistration);
    err.status = 403;
    throw err;
  }

  const exists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }],
  });

  if (exists) {
    const err = new Error(Messages.auth.userAlreadyExists);
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    role: userRole,
    passwordHash,
  });

  const tokens = buildAuthResponse(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  return { user, ...tokens };
}

async function login(input) {
  const { emailOrPhone, password } = input;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
  });

  if (!user) {
    const err = new Error(Messages.auth.invalidCredentials);
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error(Messages.auth.invalidCredentials);
    err.status = 401;
    throw err;
  }

  const tokens = buildAuthResponse(user);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  return { user, ...tokens };
}

async function refresh(input) {
  const { refreshToken } = input;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    const err = new Error(Messages.auth.invalidRefreshToken);
    err.status = 401;
    throw err;
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    const err = new Error(Messages.auth.refreshTokenNotRecognized);
    err.status = 401;
    throw err;
  }

  const tokens = buildAuthResponse(user);

  user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  return { user, ...tokens };
}

async function logout(input) {
  const { refreshToken } = input;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    return { success: true };
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    return { success: true };
  }

  user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
  await user.save();

  return { success: true };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
};
