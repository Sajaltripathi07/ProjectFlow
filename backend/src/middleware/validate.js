const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Middleware: Runs after express-validator chains to check for errors.
 * Returns 422 with structured errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return sendError(res, HTTP_STATUS.UNPROCESSABLE, "Validation failed", formatted);
  }
  next();
};

module.exports = validate;
