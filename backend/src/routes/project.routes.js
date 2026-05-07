const express = require("express");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/project.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const {
  createProjectValidation,
  updateProjectValidation,
  memberValidation,
} = require("../validations/project.validation");
const validate = require("../middleware/validate");
const { ROLES } = require("../config/constants");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getProjects)
  .post(authorize(ROLES.ADMIN), createProjectValidation, validate, createProject);

router.route("/:id")
  .get(getProjectById)
  .put(authorize(ROLES.ADMIN), updateProjectValidation, validate, updateProject)
  .delete(authorize(ROLES.ADMIN), deleteProject);

router.post("/:id/members", authorize(ROLES.ADMIN), memberValidation, validate, addMember);
router.delete("/:id/members/:userId", authorize(ROLES.ADMIN), removeMember);

module.exports = router;
