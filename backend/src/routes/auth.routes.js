const express = require("express");
const { signup, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { signupValidation, loginValidation } = require("../validations/auth.validation");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/signup", signupValidation, validate, signup);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);

module.exports = router;
