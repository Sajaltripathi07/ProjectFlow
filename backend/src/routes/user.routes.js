const express = require("express");
const { getUsers, getUserById } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getUsers);
router.get("/:id", getUserById);

module.exports = router;
