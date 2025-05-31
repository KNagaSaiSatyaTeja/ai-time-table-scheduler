const teacher = require("../models/Teacher.js");

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addTeacher = async (req, res) => {
  const { name, department, email, subjects, contactNumber, availability } =
    req.body;

  try {
    const newTeacher = new teacher({
      name,
      department,
      email,
      subjects,
      contactNumber,
      availability,
    });

    await newTeacher.save();
    res
      .status(201)
      .json({ message: "Teacher added successfully", teacher: newTeacher });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res
      .status(400)
      .json({ message: "Error adding teacher", error: error.message });
  }
};
const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, department, email, subjects, contactNumber, availability } =
    req.body;

  try {
    const updatedTeacher = await teacher.findByIdAndUpdate(
      id,
      { name, department, email, subjects, contactNumber, availability },
      { new: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res
      .status(200)
      .json({
        message: "Teacher updated successfully",
        teacher: updatedTeacher,
      });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res
      .status(400)
      .json({ message: "Error updating teacher", error: error.message });
  }
};
const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeacher = await teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getAllTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
};
