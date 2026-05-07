const logger = require("../utils/logger");

// Handles Mongoose CastError (invalid ObjectId).
 
const handleCastError = (err) => ({
  statusCode: 400,
  message: `Invalid ${err.path}: ${err.value}`,
});

// Handles Mongoose duplicate key error (code 11000).
 
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    statusCode: 409,
    message: `A record with that ${field} already exists.`,
  };
};

// Handles Mongoose ValidationError.

const handleValidationError = (err) => ({
  statusCode: 422,
  message: Object.values(err.errors)
    .map((e) => e.message)
    .join(", "),
});

// Handles invalid JWT.
 
const handleJWTError = () => ({
  statusCode: 401,
  message: "Invalid token. Please log in again.",
});


//  Handles expired JWT.
 
const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: "Your session has expired. Please log in again.",
});

// Global Error Handler 
const errorHandler = (err, req, res, _next) => {
  let { statusCode = 500, message = "Internal Server Error" } = err;

  // Map known error types
  if (err.name === "CastError") ({ statusCode, message } = handleCastError(err));
  else if (err.code === 11000) ({ statusCode, message } = handleDuplicateKeyError(err));
  else if (err.name === "ValidationError") ({ statusCode, message } = handleValidationError(err));
  else if (err.name === "JsonWebTokenError") ({ statusCode, message } = handleJWTError());
  else if (err.name === "TokenExpiredError") ({ statusCode, message } = handleJWTExpiredError());

  // Log server errors 
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
