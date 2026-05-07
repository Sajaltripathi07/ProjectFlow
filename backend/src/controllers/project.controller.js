const projectService = require("../services/project.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../config/constants");

const getProjects = asyncHandler(async (req, res) => {
  const { projects, meta } = await projectService.getProjects(req.user._id, req.user.role, req.query);
  sendSuccess(res, HTTP_STATUS.OK, "Projects fetched.", projects, meta);
});

const getProjectById = asyncHandler(async (req, res) => {
  const { project, taskStats } = await projectService.getProjectById(req.params.id, req.user._id, req.user.role);
  sendSuccess(res, HTTP_STATUS.OK, "Project fetched.", { project, taskStats });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user._id);
  sendSuccess(res, HTTP_STATUS.CREATED, "Project created.", project);
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user._id);
  sendSuccess(res, HTTP_STATUS.OK, "Project updated.", project);
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user._id);
  sendSuccess(res, HTTP_STATUS.OK, "Project deleted.");
});

const addMember = asyncHandler(async (req, res) => {
  const project = await projectService.addMember(req.params.id, req.body.userId, req.user._id);
  sendSuccess(res, HTTP_STATUS.OK, "Member added.", project);
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await projectService.removeMember(req.params.id, req.params.userId, req.user._id);
  sendSuccess(res, HTTP_STATUS.OK, "Member removed.", project);
});

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject, addMember, removeMember };
