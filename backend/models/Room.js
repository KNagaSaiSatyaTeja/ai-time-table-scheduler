const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    building: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["classroom", "lab", "lecture-hall"],
      default: "classroom",
    },

    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
    ],
    faculty: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
      },
    ],
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    semester: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Room", roomSchema);
