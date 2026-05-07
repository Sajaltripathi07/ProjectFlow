const Task = require("../models/task.model");
const Project = require("../models/project.model");
const Activity = require("../models/activity.model");
const AppError = require("../utils/AppError");
const { HTTP_STATUS, ROLES, TASK_STATUS } = require("../config/constants");
const { getPagination, buildPaginationMeta } = require("../utils/pagination");

/**
 * Checks if user has access to the project (owner or member).
 * Returns the full project document.
 */
const assertProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId).populate("members", "name email role");
  if (!project) throw new AppError("Project not found.", HTTP_STATUS.NOT_FOUND);

  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some((m) => m._id.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw new AppError("You do not have access to this project.", HTTP_STATUS.FORBIDDEN);
  }

  return project;
};

const getTasks = async (projectId, userId, userRole, query) => {
  await assertProjectAccess(projectId, userId);

  const { page, limit, skip } = getPagination(query);

  const filter = { project: projectId };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.assigneeId) filter.assignee = query.assigneeId;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("assignee", "name email role")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, meta: buildPaginationMeta(total, page, limit) };
};

const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId)
    .populate("assignee", "name email role")
    .populate("createdBy", "name email")
    .populate("project", "name");

  if (!task) throw new AppError("Task not found.", HTTP_STATUS.NOT_FOUND);

  await assertProjectAccess(task.project._id, userId);

  return task;
};

const createTask = async (
  { title, description, projectId, assigneeId, status, priority, dueDate },
  userId
) => {
  const project = await assertProjectAccess(projectId, userId);

  /* ── Validate assignee is part of the project ── */
  if (assigneeId) {
    const memberIds = project.members.map((m) => m._id.toString());
    const isProjectMember = memberIds.includes(assigneeId.toString());
    const isOwner = project.owner.toString() === assigneeId.toString();

    if (!isProjectMember && !isOwner) {
      throw new AppError(
        "Assignee must be a member of the project.",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignee: assigneeId || null,
    createdBy: userId,
    status: status || "todo",
    priority: priority || "medium",
    dueDate: dueDate || null,
  });

  await Activity.create({
    user: userId,
    action: "created task",
    entityType: "task",
    entityId: task._id,
    entityName: task.title,
    project: projectId,
  });

  return task.populate([
    { path: "assignee", select: "name email role" },
    { path: "createdBy", select: "name email" },
  ]);
};

const updateTask = async (taskId, updates, userId, userRole) => {
  const task = await Task.findById(taskId).populate("project", "owner members");
  if (!task) throw new AppError("Task not found.", HTTP_STATUS.NOT_FOUND);

  const project = task.project;
  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some((m) => m.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw new AppError("Access denied.", HTTP_STATUS.FORBIDDEN);
  }

  /* ── Members can only update status ── */
  if (userRole === ROLES.MEMBER) {
    const forbiddenKeys = Object.keys(updates).filter((k) => k !== "status");
    if (forbiddenKeys.length > 0) {
      throw new AppError(
        "Members can only update task status.",
        HTTP_STATUS.FORBIDDEN
      );
    }
  }

  /* ── If admin is reassigning, validate new assignee is in the project ── */
  if (updates.assigneeId !== undefined && updates.assigneeId !== null) {
    const allMemberIds = project.members.map((m) => m.toString());
    const isValidAssignee =
      allMemberIds.includes(updates.assigneeId.toString()) ||
      project.owner.toString() === updates.assigneeId.toString();

    if (!isValidAssignee) {
      throw new AppError(
        "Assignee must be a member of the project.",
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /* ── Apply allowed field updates ── */
  const fieldMap = {
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    dueDate: "dueDate",
  };

  Object.entries(fieldMap).forEach(([key, field]) => {
    if (updates[key] !== undefined) task[field] = updates[key];
  });

  // Handle assignee separately (comes in as assigneeId)
  if (updates.assigneeId !== undefined) {
    task.assignee = updates.assigneeId || null;
  }

  await task.save();

  /* ── Log activity ── */
  let actionLabel = "updated task";
  if (updates.status) actionLabel = `moved task to ${updates.status.replace("_", " ")}`;
  else if (updates.assigneeId) actionLabel = "reassigned task";

  await Activity.create({
    user: userId,
    action: actionLabel,
    entityType: "task",
    entityId: task._id,
    entityName: task.title,
    project: project._id,
    meta: { status: task.status },
  });

  return task.populate([
    { path: "assignee", select: "name email role" },
    { path: "createdBy", select: "name email" },
  ]);
};

const deleteTask = async (taskId, userId, userRole) => {
  const task = await Task.findById(taskId).populate("project", "owner");
  if (!task) throw new AppError("Task not found.", HTTP_STATUS.NOT_FOUND);

  if (
    userRole !== ROLES.ADMIN &&
    task.project.owner.toString() !== userId.toString()
  ) {
    throw new AppError(
      "Only admins or the project owner can delete tasks.",
      HTTP_STATUS.FORBIDDEN
    );
  }

  await task.deleteOne();
  await Activity.deleteMany({ entityType: "task", entityId: taskId });
};

const getMyTasks = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { assignee: userId };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, meta: buildPaginationMeta(total, page, limit) };
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
};
