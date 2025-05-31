const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_timetable",
          "manage_courses",
          "manage_teachers",
        ],
        required: true,
      },
    ],
    contactNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
