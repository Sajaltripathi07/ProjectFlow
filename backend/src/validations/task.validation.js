const { body } = require("express-validator");
const { TASK_STATUS, TASK_PRIORITY } = require("../config/constants");

const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Task title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be 3–100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("projectId")
    .notEmpty().withMessage("Project ID is required")
    .isMongoId().withMessage("Invalid project ID"),
  body("assigneeId")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId().withMessage("Invalid assignee ID"),
  body("status")
    .optional()
    .isIn(Object.values(TASK_STATUS)).withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(Object.values(TASK_PRIORITY)).withMessage("Invalid priority"),
  body("dueDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage("Due date must be a valid ISO 8601 date"),
];

const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("Title must be 3–100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("assigneeId")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId().withMessage("Invalid assignee ID"),
  body("status")
    .optional()
    .isIn(Object.values(TASK_STATUS)).withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(Object.values(TASK_PRIORITY)).withMessage("Invalid priority"),
  body("dueDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage("Due date must be a valid ISO 8601 date"),
];

const updateStatusValidation = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(Object.values(TASK_STATUS)).withMessage("Invalid status value"),
];

module.exports = { createTaskValidation, updateTaskValidation, updateStatusValidation };
