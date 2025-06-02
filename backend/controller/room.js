const Room = require("../models/Room");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("subjects", "name code")
      .sort({ building: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "subjects",
      "name code department"
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

const addRoom = async (req, res) => {
  try {
    const {
      name,
      building,
      department,
      capacity = 60,
      type = "classroom",
      subjects = [],
      faculty = [],
      year = new Date().getFullYear(),
      semester = 1,
      isAvailable = true,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !building ||
      !department ||
      !capacity ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, building, department, capacity, or subjects",
      });
    }

    const room = new Room({
      name,
      building,
      department,
      capacity,
      type,

      subjects,
      faculty,
      year,
      semester,
      isAvailable,
    });

    await room.save();

    res.status(201).json({
      success: true,
      data: room,
      message: "Room created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
};
