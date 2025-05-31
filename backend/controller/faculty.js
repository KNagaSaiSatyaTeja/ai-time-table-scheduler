const Teacher = require("../models/Teacher.js");
const { validationResult } = require("express-validator");

// Get all teachers with optional filters
const getAllTeachers = async (req, res) => {
  try {
    const { department, subject } = req.query;
    let query = {};

    // Add filters if provided
    if (department) query.department = department;
    if (subject) query.subjects = { $in: [subject] };

    const teachers = await Teacher.find(query)
      .select("-password")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message,
    });
  }
};

// Add new teacher
const addTeacher = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, department, email, subjects, contactNumber, availability } =
      req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Teacher with this email already exists",
      });
    }

    const newTeacher = new Teacher({
      name,
      department,
      email,
      subjects,
      contactNumber,
      availability: availability || [],
    });

    await newTeacher.save();

    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      data: newTeacher,
    });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(400).json({
      success: false,
      message: "Failed to add teacher",
      error: error.message,
    });
  }
};

// Update existing teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Check if email is being updated and is unique
    if (updates.email) {
      const existingTeacher = await Teacher.findOne({
        email: updates.email,
        _id: { $ne: id },
      });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another teacher",
        });
      }
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update teacher",
      error: error.message,
    });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTeacher = await Teacher.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher deleted successfully",
      data: deletedTeacher,
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete teacher",
      error: error.message,
    });
  }
};

// Get single teacher by ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id).select("-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teacher",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  deleteTeacher,
};
