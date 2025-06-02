const { body } = require("express-validator");

exports.roomValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({ min: 2 })
    .withMessage("Room name must be at least 2 characters long"),

  body("building").trim().notEmpty().withMessage("Building name is required"),

  // body("department").trim().notEmpty().withMessage("Department is required"),

  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive number"),

  body("type")
    .optional()
    .isIn(["classroom", "lab", "lecture-hall"])
    .withMessage("Invalid room type"),

  // body("facilities")
  //   .optional()
  //   .isArray()
  //   .withMessage("Facilities must be an array"),

  body("subjects")
    .isArray()
    .withMessage("Subjects must be an array")
    .notEmpty()
    .withMessage("At least one subject must be assigned"),

  body("subjects.*").isMongoId().withMessage("Invalid subject ID format"),

  body("equipments")
    .optional()
    .isArray()
    .withMessage("Equipments must be an array"),

  body("equipments.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Equipment name is required"),

  body("equipments.*.quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Equipment quantity must be a positive number"),

  body("equipments.*.condition")
    .optional()
    .isIn(["good", "fair", "maintenance-required"])
    .withMessage("Invalid equipment condition"),
];
