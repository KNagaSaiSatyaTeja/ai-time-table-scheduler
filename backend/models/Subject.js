const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  no_of_classes_per_week: {
    type: Number,
    required: true,
  },
  periods_per_day: {
    type: Number,
    default: 1,
    min: 1,
    max: 8
  },
  periods_per_week: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  max_continuous_periods: {
    type: Number,
    default: 2,
    min: 1,
    max: 4
  },
  faculty: [
    {
      id: String,
      name: String,
      availability: [
        {
          day: String,
          startTime: String,
          endTime: String,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Subject", SubjectSchema);
