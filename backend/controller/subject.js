const Subject = require("../models/Subject");
const { validationResult } = require("express-validator");

// Get all subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate("prerequisites");
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
};

// Add new subject
const addSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json({
      success: true,
      message: "Subject added successfully",
      data: subject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to add subject",
      error: error.message,
    });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update subject",
      error: error.message,
    });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
};
