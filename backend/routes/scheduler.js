const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');
const Room = require('../models/Room');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

const router = express.Router();

const SCHEDULER_API_URL = process.env.SCHEDULER_API_URL || 'http://localhost:8000';

// @route   POST /api/scheduler/generate
// @desc    Generate schedule for a room
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    const { roomId, useGeneticAlgorithm = false } = req.body;

    // Get room data with populated subjects and faculty
    const room = await Room.findById(roomId)
      .populate('subjects')
      .populate('faculty');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Transform data for scheduler API
    const schedulerInput = {
      subjects: room.subjects.map(subject => ({
        name: subject.name,
        time: subject.duration || 50,
        no_of_classes_per_week: subject.classesPerWeek || 3,
        faculty: subject.faculty ? subject.faculty.map(f => ({
          id: f._id.toString(),
          name: f.name,
          availability: f.availability || [
            { day: "MONDAY", startTime: "09:00", endTime: "17:00" },
            { day: "TUESDAY", startTime: "09:00", endTime: "17:00" },
            { day: "WEDNESDAY", startTime: "09:00", endTime: "17:00" },
            { day: "THURSDAY", startTime: "09:00", endTime: "17:00" },
            { day: "FRIDAY", startTime: "09:00", endTime: "17:00" },
            { day: "SATURDAY", startTime: "09:00", endTime: "13:00" }
          ]
        })) : []
      })),
      break_: [
        { day: "ALL_DAYS", startTime: "11:00", endTime: "11:15" },
        { day: "ALL_DAYS", startTime: "13:00", endTime: "14:00" }
      ],
      college_time: {
        startTime: "09:00",
        endTime: "17:00"
      },
      rooms: [roomId]
    };

    // Call scheduler API
    const schedulerResponse = await axios.post(
      `${SCHEDULER_API_URL}/generate-schedule`,
      schedulerInput,
      {
        params: { use_ga: useGeneticAlgorithm },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    res.json({
      success: true,
      schedule: schedulerResponse.data,
      room: room
    });

  } catch (error) {
    console.error('Scheduler generation error:', error);
    res.status(500).json({
      message: 'Error generating schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/scheduler/history
// @desc    Get schedule generation history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const response = await axios.get(`${SCHEDULER_API_URL}/schedule-history`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching schedule history:', error);
    res.status(500).json({
      message: 'Error fetching schedule history',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/scheduler/table
// @desc    Get latest schedule in table format
// @access  Private
router.get('/table', auth, async (req, res) => {
  try {
    const response = await axios.get(`${SCHEDULER_API_URL}/schedule-table`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching schedule table:', error);
    res.status(500).json({
      message: 'Error fetching schedule table',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/scheduler/validate
// @desc    Validate schedule input data
// @access  Private
router.post('/validate', auth, async (req, res) => {
  try {
    const { roomId } = req.body;
    
    const room = await Room.findById(roomId)
      .populate('subjects')
      .populate('faculty');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const validation = {
      isValid: true,
      issues: [],
      warnings: []
    };

    // Check if room has subjects
    if (!room.subjects || room.subjects.length === 0) {
      validation.isValid = false;
      validation.issues.push('Room has no subjects assigned');
    }

    // Check if subjects have faculty
    room.subjects.forEach(subject => {
      if (!subject.faculty || subject.faculty.length === 0) {
        validation.warnings.push(`Subject ${subject.name} has no faculty assigned`);
      }
    });

    res.json(validation);

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      message: 'Error validating schedule data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;