const express = require("express");
const router = express.Router();
const Faculty = require("../models/faculty");
const auth = require("../middleware/auth");
const {
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controller/faculty.js");

// Get all faculty members
router.get("/", getAllTeachers);

// Add new faculty member
router.post("/", addTeacher);
// Update faculty member by ID
router.put("/:id", updateTeacher);

router.delete("/:id", deleteTeacher);

module.exports = router;
