const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  college_time: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  break_: [
    {
      day: String,
      startTime: String,
      endTime: String,
    },
  ],
  rooms: {
    type: [String],
    required: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  ],
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
