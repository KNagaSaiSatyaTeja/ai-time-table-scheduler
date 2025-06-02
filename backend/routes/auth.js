const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { login, register } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

// Validation middleware
const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const registerValidation = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .optional()
    .isIn(["admin", "teacher", "student"])
    .withMessage("Invalid role"),
];

// Auth routes
router.post("/login", loginValidation, login);
router.post("/register", registerValidation, register);

// Token verification route
router.get("/verify", protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

module.exports = router;
