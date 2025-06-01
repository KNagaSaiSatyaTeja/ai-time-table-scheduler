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
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    equipments: [
      {
        name: String,
        quantity: Number,
        condition: {
          type: String,
          enum: ["good", "fair", "maintenance-required"],
          default: "good",
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Room", roomSchema);
