const Room = require("../models/Room");
const Subject = require("../models/Subject");
const Teacher = require("../models/Teacher");
const User = require("../models/users");
const Activity = require("../models/Activity");

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [totalRooms, totalSubjects, totalTeachers, totalStudents] =
      await Promise.all([
        Room.countDocuments(),
        Subject.countDocuments(),
        Teacher.countDocuments(),
        User.countDocuments({ role: "student" }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        totalSubjects,
        totalTeachers,
        totalStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};

// Get recent activities
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "username");

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
    });
  }
};
