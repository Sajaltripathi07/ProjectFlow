const Project = require("../models/project.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES, HTTP_STATUS } = require("../config/constants");

/**
 * Middleware: Confirms req.user is the project owner or a member.
 * Attaches project to req.project.
 */
const projectAccess = asyncHandler(async (req, _res, next) => {
  const project = await Project.findById(req.params.projectId || req.params.id);

  if (!project) {
    return next(new AppError("Project not found.", HTTP_STATUS.NOT_FOUND));
  }

  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);

  if (!isOwner && !isMember) {
    return next(new AppError("You do not have access to this project.", HTTP_STATUS.FORBIDDEN));
  }

  req.project = project;
  req.isProjectOwner = isOwner;
  next();
});

// Middleware: Confirms req.user is the project owner (admin action).
 
const projectOwnerOnly = asyncHandler(async (req, _res, next) => {
  if (req.user.role === ROLES.ADMIN && !req.isProjectOwner) {
    // Already loaded in projectAccess – re-check
    const project = req.project;
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return next(new AppError("Only the project owner can perform this action.", HTTP_STATUS.FORBIDDEN));
    }
  }
  next();
});

module.exports = { projectAccess, projectOwnerOnly };
