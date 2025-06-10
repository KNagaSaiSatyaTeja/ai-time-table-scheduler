const express = require("express");
const { body, validationResult } = require("express-validator");
const Room = require("../models/Room");
const { auth, adminAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get("/", async (req, res) => {
  try {
    console.log("\n=== GET ROOMS REQUEST ===");
    console.log("Query params:", req.query);

    const {
      page = 1,
      limit = 10,
      search,
      type,
      building,
      isActive,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { building: { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;
    if (building) query.building = { $regex: building, $options: "i" };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const rooms = await Room.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Room.countDocuments(query);

    console.log(`Found ${rooms.length} rooms`);
    console.log("=== END GET ROOMS ===\n");

    res.json({
      rooms,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("\n=== GET ROOMS ERROR ===");
    console.error(error);
    console.error("=== END ERROR ===\n");
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findOne({
      $or: [{ _id: req.params.id }, { name: req.params.id }],
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private (Admin)
router.post(
  "/",
  [
    adminAuth,
    body("number")
      .isAlphanumeric()
      .withMessage("Room number must be a alphanumeric value "),

    body("capacity")
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage("Capacity must be between 1 and 500"),
    body("type")
      .optional()
      .isIn(["classroom", "laboratory"])
      .withMessage("Invalid room type"),
  ],
  async (req, res) => {
    try {
      console.log("\n=== CREATE ROOM REQUEST ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Check for existing room
      const existingRoom = await Room.findOne({ number: req.body.number });

      if (existingRoom) {
        console.log(`Room with name "${req.body.name}" already exists`);
        return res
          .status(400)
          .json({ message: "Room with this name already exists" });
      }

      const room = new Room(req.body);
      await room.save();

      console.log("Created room:", JSON.stringify(room, null, 2));
      console.log("=== END CREATE ROOM ===\n");

      res.status(201).json({
        message: "Room created successfully",
        room,
      });
    } catch (error) {
      console.error("\n=== CREATE ROOM ERROR ===");
      console.error(error);
      console.error("Stack:", error.stack);
      console.error("=== END ERROR ===\n");

      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "Room with this name already exists" });
      }
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
  }
);

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Admin)
router.put(
  "/:id",
  [
    adminAuth,
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage("Room name must be between 1 and 20 characters"),
    body("capacity")
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage("Capacity must be between 1 and 500"),
    body("type")
      .optional()
      .isIn(["classroom", "laboratory", "auditorium", "seminar_hall"])
      .withMessage("Invalid room type"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
  ],
  async (req, res) => {
    try {
      console.log("\n=== UPDATE ROOM REQUEST ===");
      console.log("Room ID:", req.params.id);
      console.log("Update data:", JSON.stringify(req.body, null, 2));

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const room = await Room.findOne({
        $or: [{ _id: req.params.id }, { name: req.params.id }],
      });

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Check if updating name conflicts with existing room
      if (req.body.name && req.body.name !== room.name) {
        const existingRoom = await Room.findOne({
          name: req.body.name,
          _id: { $ne: room._id },
        });
        if (existingRoom) {
          return res
            .status(400)
            .json({ message: "Room with this name already exists" });
        }
      }

      Object.assign(room, req.body);
      await room.save();

      console.log("Updated room:", JSON.stringify(room, null, 2));
      console.log("=== END UPDATE ROOM ===\n");

      res.json({
        message: "Room updated successfully",
        room,
      });
    } catch (error) {
      console.error("\n=== UPDATE ROOM ERROR ===");
      console.error(error);
      console.error("Stack:", error.stack);
      console.error("=== END ERROR ===\n");
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
  }
);

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    console.log("\n=== DELETE ROOM REQUEST ===");
    console.log("Room ID:", req.params.id);

    const room = await Room.findOne({
      $or: [{ _id: req.params.id }, { name: req.params.id }],
    });

    if (!room) {
      console.log("Room not found");
      return res.status(404).json({ message: "Room not found" });
    }

    await Room.deleteOne({ _id: room._id });

    console.log("Deleted room:", JSON.stringify(room, null, 2));
    console.log("=== END DELETE ROOM ===\n");

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("\n=== DELETE ROOM ERROR ===");
    console.error(error);
    console.error("Stack:", error.stack);
    console.error("=== END ERROR ===\n");
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
