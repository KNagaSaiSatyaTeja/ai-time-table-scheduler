const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: [true, "Room number is required"],
      unique: true,
      min: [1, "Room number must be at least 1"],
    },
    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
      max: [500, "Capacity cannot exceed 500"],
    },
    type: {
      type: String,
      enum: ["classroom", "laboratory"],
      default: "classroom",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient queries (removed duplicate index for 'name' since it's already unique)
roomSchema.index({ type: 1 });
roomSchema.index({ building: 1 });

module.exports = mongoose.model("Room", roomSchema);
