const Room = require("../models/Room");

exports.getAllRooms = async (req, res) => {
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

exports.getRoomById = async (req, res) => {
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
