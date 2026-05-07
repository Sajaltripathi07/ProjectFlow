const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../config/constants");

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.signup({ name, email, password, role });
  sendSuccess(res, HTTP_STATUS.CREATED, "Account created successfully.", { user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });
  sendSuccess(res, HTTP_STATUS.OK, "Logged in successfully.", { user, token });
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, HTTP_STATUS.OK, "User profile fetched.", { user: req.user });
});

module.exports = { signup, login, getMe };
