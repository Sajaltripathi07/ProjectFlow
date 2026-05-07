const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../config/constants");

// GET /api/users — Admin: list all users; used for member assignment
 
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select("name email role").sort({ name: 1 });
  sendSuccess(res, HTTP_STATUS.OK, "Users fetched.", users);
});

// GET /api/users/:id
 
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("name email role createdAt");
  if (!user) return sendSuccess(res, HTTP_STATUS.NOT_FOUND, "User not found.");
  sendSuccess(res, HTTP_STATUS.OK, "User fetched.", user);
});

module.exports = { getUsers, getUserById };
