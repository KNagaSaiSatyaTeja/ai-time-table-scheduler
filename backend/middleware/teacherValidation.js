const { body } = require("express-validator");

exports.teacherValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),

  body("email").trim().isEmail().withMessage("Please enter a valid email"),

  body("department").trim().notEmpty().withMessage("Department is required"),

  body("subjects")
    .isArray()
    .withMessage("Subjects must be an array")
    .notEmpty()
    .withMessage("At least one subject is required"),

  body("contactNumber")
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage("Please enter a valid contact number"),

  body("availability")
    .optional()
    .isArray()
    .withMessage("Availability must be an array"),
];
