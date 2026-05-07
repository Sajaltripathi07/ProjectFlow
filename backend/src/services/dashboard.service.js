const mongoose = require("mongoose");
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const Activity = require("../models/activity.model");
const { ROLES, TASK_STATUS } = require("../config/constants");
const logger = require("../utils/logger");

const getDashboardStats = async (userId, userRole) => {
  /* ── Ensure userId is always a proper ObjectId ── */
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());

  logger.debug(`Dashboard: userId=${userObjectId}, role=${userRole}`);

  /* ── Find all projects this user can access ── */
  const projectFilter =
    userRole === ROLES.ADMIN
      ? { $or: [{ owner: userObjectId }, { members: userObjectId }] }
      : { members: userObjectId };

  const userProjects = await Project.find(projectFilter).select("_id name").lean();

  logger.debug(`Dashboard: found ${userProjects.length} projects: ${userProjects.map(p => p.name).join(", ")}`);

  const projectIds = userProjects.map((p) => p._id);

  /* ── If no projects, return zeroed stats immediately ── */
  if (projectIds.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      overdueTasks: 0,
      projectCount: 0,
      tasksByStatus: { todo: 0, in_progress: 0, done: 0 },
      recentActivity: [],
    };
  }

  const taskFilter = { project: { $in: projectIds } };

  const overdueFilter = {
    project: { $in: projectIds },
    status: { $ne: TASK_STATUS.DONE },
    dueDate: { $lt: new Date(), $ne: null },
  };

  const [taskStats, overdueTasks, recentActivity, projectCount] = await Promise.all([
    Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Task.countDocuments(overdueFilter),
    Activity.find({ project: { $in: projectIds } })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Project.countDocuments(projectFilter),
  ]);

  logger.debug(`Dashboard: taskStats=${JSON.stringify(taskStats)}`);

  /* ── Normalize task stats ── */
  const statsMap = { todo: 0, in_progress: 0, done: 0 };
  taskStats.forEach(({ _id, count }) => {
    if (_id) statsMap[_id] = count;
  });

  const totalTasks = statsMap.todo + statsMap.in_progress + statsMap.done;

  return {
    totalTasks,
    completedTasks: statsMap.done,
    inProgressTasks: statsMap.in_progress,
    todoTasks: statsMap.todo,
    overdueTasks,
    projectCount,
    tasksByStatus: statsMap,
    recentActivity,
  };
};

module.exports = { getDashboardStats };
