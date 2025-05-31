const express = require("express");
const router = express.Router();
const {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
} = require("../controller/subject");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").get(getAllSubjects).post(addSubject);

router.route("/:id").put(updateSubject).delete(deleteSubject);

module.exports = router;
