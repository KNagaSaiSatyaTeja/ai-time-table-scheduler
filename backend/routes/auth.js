const { loginController } = require("../controller/auth");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  loginController
);
// Registration route

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
