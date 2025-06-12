const express = require("express");
const Schedule = require("../models/Schedule");
const Subject = require("../models/Subject");
const Timetable = require("../models/Timetable");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/timetable/generate
// @desc    Generate timetable from schedule
// @access  Private (Admin)
// router.post("/generate", adminAuth, async (req, res) => {

router.post("/generate",adminAuth, async (req, res) => {
  try {
    const scheduleData = req.body;

    // Validate required fields
    if (
      !scheduleData.college_time ||
      !scheduleData.rooms ||
      !scheduleData.subjects
    ) {
      return res.status(400).json({
        message: "Incomplete schedule data provided",
      });
    }

    // First create Subject documents for each subject
    const subjectPromises = scheduleData.subjects.map(async (subjectData) => {
      const subject = new Subject({
        name: subjectData.name,
        duration: subjectData.duration,
        time: subjectData.time,
        no_of_classes_per_week: subjectData.no_of_classes_per_week,
        periods_per_day: subjectData.periods_per_day || 1,
        periods_per_week: subjectData.periods_per_week || subjectData.no_of_classes_per_week,
        max_continuous_periods: subjectData.max_continuous_periods || 2,
        faculty: subjectData.faculty,
      });
      await subject.save();
      return subject._id;
    });

    const subjectIds = await Promise.all(subjectPromises);

    // Create Schedule with proper fields and subject references
    const schedule = new Schedule({
      college_time: scheduleData.college_time,
      rooms: scheduleData.rooms,
      subjects: subjectIds,
      department: scheduleData.department || "Computer Science",
      semester: scheduleData.semester || 1,
      break_: scheduleData.break_ || [],
    });

    await schedule.save();

    // Call the FastAPI endpoint
    const response = await fetch(
      "http://127.0.0.1:8000/api/generate-schedule",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate timetable");
    }

    const result = await response.json();

    // Validate response data
    if (!result || !result.weekly_schedule || !result.weekly_schedule.days) {
      throw new Error("Invalid response format from timetable generator");
    }

    // Transform the weekly schedule into the format needed for Timetable model
    const classes = Object.entries(result.weekly_schedule.days).flatMap(
      ([day, slots]) =>
        slots.map((slot) => ({
          subject: slot.subject_name,
          faculty: {
            id: slot.faculty_id,
            name: slot.faculty_name,
          },
          day: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room_id,
          duration: calculateDuration(slot.startTime, slot.endTime), // Add duration calculation
          isSpecial: slot.is_special || false,
        }))
    );

    // Add this helper function for duration calculation
    function calculateDuration(startTime, endTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes - startMinutes;
    }

    // Create the timetable with reference to the schedule
    const timetable = new Timetable({
      schedule: schedule._id,
      classes: classes,
      timeSlots: result.weekly_schedule.time_slots,
      generation_date: new Date(),
      academic_year: scheduleData.academic_year || new Date().getFullYear(),
      semester: scheduleData.semester || 1,
      department: scheduleData.department || "Computer Science",
      isActive: true,
      statistics: {
        fitness: result.fitness,
        preference_score: result.preference_score,
        break_slots: result.break_slots,
        total_assignments: result.total_assignments,
        total_available_slots: result.total_available_slots,
        utilization_percentage: result.utilization_percentage,
      },
    });

    await timetable.save();

    // Return the created timetable
    const savedTimetable = await Timetable.findById(timetable._id).populate(
      "schedule"
    );

    res.status(201).json({
      timetable: savedTimetable,
      statistics: result.statistics,
      tabular_view: result.tabular_schedule.html,
    });
  } catch (error) {
    console.error("Generate timetable error:", error);
    res.status(500).json({
      message: "Failed to generate timetable",
      error: error.message,
      details: error.stack,
    });
  }
});
// @route   GET /api/timetable
// @desc    Get all timetables
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      academic_year,
      semester,
      department,
      isActive,
    } = req.query;

    const query = {};

    if (academic_year) query.academic_year = academic_year;
    if (semester) query.semester = semester;
    if (department) query.department = { $regex: department, $options: "i" };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const timetables = await Timetable.find(query)
      .populate("schedule")
      .populate("classes.subject")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ generation_date: -1 });

    const total = await Timetable.countDocuments(query);

    res.json({
      timetables,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get timetables error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/timetable/:id
// @desc    Get timetable by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate("schedule")
      .populate("classes.subject");

    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.json(timetable);
  } catch (error) {
    console.error("Get timetable error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Timetable not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable
// @access  Private (Admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    await Timetable.findByIdAndDelete(req.params.id);

    res.json({ message: "Timetable deleted successfully" });
  } catch (error) {
    console.error("Delete timetable error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Timetable not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to generate time slots
function generateTimeSlots(collegeTime, breaks) {
  const slots = [];
  const startTime = parseTime(collegeTime.startTime);
  const endTime = parseTime(collegeTime.endTime);

  let currentTime = startTime;
  const slotDuration = 50; // minutes

  while (currentTime + slotDuration <= endTime) {
    const slotStart = formatTime(currentTime);
    const slotEnd = formatTime(currentTime + slotDuration);

    // Check if this slot conflicts with any break
    const isBreakTime = breaks.some((breakTime) =>
      isTimeOverlap(slotStart, slotEnd, breakTime.startTime, breakTime.endTime)
    );

    if (!isBreakTime) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
    }

    currentTime += slotDuration + 10; // 10 minute gap between classes
  }

  return slots;
}

// Helper functions for time manipulation
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

function isTimeWithinAvailability(startTime, endTime, availStart, availEnd) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const availStartMin = parseTime(availStart);
  const availEndMin = parseTime(availEnd);

  return start >= availStartMin && end <= availEndMin;
}

function isTimeOverlap(start1, end1, start2, end2) {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);

  return s1 < e2 && s2 < e1;
}

module.exports = router;
