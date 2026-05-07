const mongoose = require("mongoose");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const Activity = require("../models/activity.model");
const AppError = require("../utils/AppError");
const { HTTP_STATUS, ROLES } = require("../config/constants");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

/**
 * Returns all projects accessible by the requesting user.
 * Cast userId to ObjectId so $or queries inside find() work reliably.
 */
const getProjects = async (userId, userRole, query) => {
  const { page, limit, skip } = getPagination(query);

  /* ── Explicit ObjectId cast ensures $or array conditions match correctly ── */
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const filter =
    userRole === ROLES.ADMIN
      ? { $or: [{ owner: userObjectId }, { members: userObjectId }] }
      : { members: userObjectId };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  return { projects, meta: buildPaginationMeta(total, page, limit) };
};

const getProjectById = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId)
    .populate("owner", "name email role")
    .populate("members", "name email role");

  if (!project) throw new AppError("Project not found.", HTTP_STATUS.NOT_FOUND);

  const isOwner = project.owner._id.toString() === userId.toString();
  const isMember = project.members.some((m) => m._id.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw new AppError("Access denied.", HTTP_STATUS.FORBIDDEN);
  }

  const taskStats = await Task.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return { project, taskStats };
};

const createProject = async ({ name, description }, userId) => {
  const project = await Project.create({
    name,
    description,
    owner: userId,
    members: [userId], // owner is always a member
  });

  await Activity.create({
    user: userId,
    action: "created project",
    entityType: "project",
    entityId: project._id,
    entityName: project.name,
    project: project._id,
  });

  return project;
};

const updateProject = async (projectId, updates, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", HTTP_STATUS.NOT_FOUND);

  if (project.owner.toString() !== userId.toString()) {
    throw new AppError("Only the project owner can update this project.", HTTP_STATUS.FORBIDDEN);
  }

  const allowed = ["name", "description"];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) project[field] = updates[field];
  });

  await project.save();

  await Activity.create({
    user: userId,
    action: "updated project",
    entityType: "project",
    entityId: project._id,
    entityName: project.name,
    project: project._id,
  });

  return project;
};

const deleteProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", HTTP_STATUS.NOT_FOUND);

  if (project.owner.toString() !== userId.toString()) {
    throw new AppError("Only the project owner can delete this project.", HTTP_STATUS.FORBIDDEN);
  }

  await Task.deleteMany({ project: projectId });
  await Activity.deleteMany({ project: projectId });
  await project.deleteOne();
};

const addMember = async (projectId, targetUserId, requestingUserId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", HTTP_STATUS.NOT_FOUND);

  if (project.owner.toString() !== requestingUserId.toString()) {
    throw new AppError("Only the project owner can add members.", HTTP_STATUS.FORBIDDEN);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError("User not found.", HTTP_STATUS.NOT_FOUND);

  if (project.members.some((m) => m.toString() === targetUserId.toString())) {
    throw new AppError("User is already a member of this project.", HTTP_STATUS.CONFLICT);
  }

  project.members.push(targetUserId);
  await project.save();

  await Activity.create({
    user: requestingUserId,
    action: `added ${user.name} to project`,
    entityType: "project",
    entityId: project._id,
    entityName: project.name,
    project: project._id,
  });

  return project.populate("members", "name email role");
};

const removeMember = async (projectId, targetUserId, requestingUserId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found.", HTTP_STATUS.NOT_FOUND);

  if (project.owner.toString() !== requestingUserId.toString()) {
    throw new AppError("Only the project owner can remove members.", HTTP_STATUS.FORBIDDEN);
  }

  if (project.owner.toString() === targetUserId.toString()) {
    throw new AppError("Cannot remove the project owner.", HTTP_STATUS.BAD_REQUEST);
  }

  project.members = project.members.filter(
    (m) => m.toString() !== targetUserId.toString()
  );
  await project.save();

  /* Unassign tasks from removed member inside this project */
  await Task.updateMany(
    { project: projectId, assignee: targetUserId },
    { $set: { assignee: null } }
  );

  return project;
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
