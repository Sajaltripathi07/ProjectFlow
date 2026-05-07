const dashboardService = require("../services/dashboard.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../config/constants");

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user._id, req.user.role);
  sendSuccess(res, HTTP_STATUS.OK, "Dashboard stats fetched.", stats);
});

module.exports = { getDashboardStats };
