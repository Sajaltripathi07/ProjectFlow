const { body, param } = require("express-validator");

const createProjectValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Project name is required")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be 3–100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const updateProjectValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("Name must be 3–100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const memberValidation = [
  body("userId")
    .notEmpty().withMessage("User ID is required")
    .isMongoId().withMessage("Invalid user ID"),
];

module.exports = { createProjectValidation, updateProjectValidation, memberValidation };
