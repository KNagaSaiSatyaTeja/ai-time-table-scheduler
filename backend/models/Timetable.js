const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule",
    required: true,
  },
  classes: [
    {
      subject: {
        type: String,
        required: true,
      },
      faculty: {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
      day: {
        type: String,
        required: true,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
      room: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      isSpecial: {
        type: Boolean,
        default: false,
      },
    },
  ],
  timeSlots: [String],
  generation_date: {
    type: Date,
    default: Date.now,
  },
  academic_year: Number,
  semester: Number,
  department: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  statistics: {
    fitness: Number,
    preference_score: Number,
    break_slots: Number,
    total_assignments: Number,
    total_available_slots: Number,
    utilization_percentage: Number,
  },
});

module.exports = mongoose.model("Timetable", TimetableSchema);
