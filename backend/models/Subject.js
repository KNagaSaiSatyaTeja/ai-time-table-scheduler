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
