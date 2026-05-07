const taskService = require("../services/task.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { HTTP_STATUS } = require("../config/constants");

const getTasks = asyncHandler(async (req, res) => {
  const { tasks, meta } = await taskService.getTasks(
    req.params.projectId,
    req.user._id,
    req.user.role,
    req.query
  );
  sendSuccess(res, HTTP_STATUS.OK, "Tasks fetched.", tasks, meta);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id);
  sendSuccess(res, HTTP_STATUS.OK, "Task fetched.", task);
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);
  sendSuccess(res, HTTP_STATUS.CREATED, "Task created.", task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user._id, req.user.role);
  sendSuccess(res, HTTP_STATUS.OK, "Task updated.", task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user._id, req.user.role);
  sendSuccess(res, HTTP_STATUS.OK, "Task deleted.");
});

const getMyTasks = asyncHandler(async (req, res) => {
  const { tasks, meta } = await taskService.getMyTasks(req.user._id, req.query);
  sendSuccess(res, HTTP_STATUS.OK, "Your tasks fetched.", tasks, meta);
});

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getMyTasks };
