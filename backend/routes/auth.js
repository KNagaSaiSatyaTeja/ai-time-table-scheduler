const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { login, register } = require("../controllers/auth");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

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

// Login route
router.post("/login", loginValidation, login);
// Registration route
router.post("/register", registerValidation, register);

// Middleware to validate request body
router.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});
// Middleware to authenticate JWT token
router.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
});
// Middleware to authorize user roles
router.use((req, res, next) => {
  const allowedRoles = ["admin", "teacher", "student"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
});
// Export the router
module.exports = router;
