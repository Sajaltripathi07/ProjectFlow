const { verifyToken } = require("../utils/jwt");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { HTTP_STATUS } = require("../config/constants");

// Middleware: Verifies JWT and attaches user to req.user.
 
const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authenticated. Please log in.", HTTP_STATUS.UNAUTHORIZED));
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    return next(new AppError("User no longer exists or is inactive.", HTTP_STATUS.UNAUTHORIZED));
  }

  req.user = user;
  next();
});

/**
 * Middleware factory: Restricts access to specified roles.
 * @param  {...string} roles
 */
const authorize = (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", HTTP_STATUS.FORBIDDEN)
      );
    }
    next();
  };

module.exports = { protect, authorize };
