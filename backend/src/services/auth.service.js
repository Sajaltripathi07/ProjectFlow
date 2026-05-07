const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Registers a new user and returns user + token.
 */
const signup = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists.", HTTP_STATUS.CONFLICT);
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);
  return { user, token };
};

/**
 * Authenticates a user and returns user + token.
 */
const login = async ({ email, password }) => {
  const user = await User.findByEmailWithPassword(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", HTTP_STATUS.UNAUTHORIZED);
  }

  const token = generateToken(user._id);

  // Strip password from returned user object
  user.password = undefined;
  return { user, token };
};

module.exports = { signup, login };
