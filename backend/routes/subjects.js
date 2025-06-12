const express = require("express");
const { body } = require("express-validator");
const { auth, adminAuth } = require("../middleware/auth");
const subjectController = require("../controllers/subjectController");

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get("/", auth, subjectController.getSubjects);

// @route   POST /api/subjects
// @desc    Create a subject
// @access  Admin
router.post(
  "/",
  [
    adminAuth,
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("code")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Code must be at least 2 characters"),
    body("department").trim().notEmpty().withMessage("Department is required"),
  ],
  subjectController.createSubject
);

// @route   PUT /api/subjects/:id
// @desc    Update a subject
// @access  Admin
router.put("/:id", adminAuth, subjectController.updateSubject);

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject
// @access  Admin
router.delete("/:id", adminAuth, subjectController.deleteSubject);

module.exports = router;
