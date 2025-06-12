const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const subjectRoutes = require("./routes/subjects");
const facultyRoutes = require("./routes/faculty");
const roomRoutes = require("./routes/rooms");
const scheduleRoutes = require("./routes/schedule");
const timetableRoutes = require("./routes/timetable");
const schedulerRoutes = require("./routes/scheduler");
const timetableConfigRoutes = require("./routes/timetableConfig");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/timetable-config", timetableConfigRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "College Timetable API is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
