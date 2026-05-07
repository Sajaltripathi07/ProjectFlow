const express = require("express");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
} = require("../controllers/task.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { createTaskValidation, updateTaskValidation } = require("../validations/task.validation");
const validate = require("../middleware/validate");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

// My tasks (assigned to me)
router.get("/my-tasks", getMyTasks);

// Tasks by project 
router.get("/project/:projectId", getTasks);
router.post("/", authorize(ROLES.ADMIN), createTaskValidation, validate, createTask);

// Individual task routes
router.route("/:id")
  .get(getTaskById)
  .put(updateTaskValidation, validate, updateTask)
  .delete(authorize(ROLES.ADMIN), deleteTask);

module.exports = router;
