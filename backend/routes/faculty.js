const express = require("express");
const router = express.Router();
const { teacherValidation } = require("../middleware/teacherValidation");
const {
  getAllTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} = require("../controller/faculty");
const { protect } = require("../middleware/auth");

router.use(protect); // Protect all routes

router.route("/").get(getAllTeachers).post(teacherValidation, addTeacher);

router
  .route("/:id")
  .get(getTeacherById)
  .put(teacherValidation, updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
