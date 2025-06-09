const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
  faculty_id: String,
  faculty_name: String,
  subjects: [
    {
      subject: String,
      day: String,
      startTime: String,
      endTime: String,
    },
  ],
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
