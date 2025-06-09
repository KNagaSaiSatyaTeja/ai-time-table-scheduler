const express = require('express');
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/Schedule');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/schedule
// @desc    Get all schedules
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, academic_year, semester, department, isActive } = req.query;
    
    const query = {};
    
    if (academic_year) query.academic_year = academic_year;
    if (semester) query.semester = semester;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const schedules = await Schedule.find(query)
      .populate('subjects')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Schedule.countDocuments(query);

    res.json({
      schedules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/schedule/:id
// @desc    Get schedule by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('subjects');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/schedule
// @desc    Create new schedule
// @access  Private (Admin)
router.post('/', [
  adminAuth,
  body('college_time.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('College start time must be in HH:MM format'),
  body('college_time.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('College end time must be in HH:MM format'),
  body('break_')
    .isArray()
    .withMessage('Breaks must be an array'),
  body('break_.*.day')
    .isIn(['ALL_DAYS', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
    .withMessage('Invalid day for break'),
  body('break_.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Break start time must be in HH:MM format'),
  body('break_.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Break end time must be in HH:MM format'),
  body('rooms')
    .isArray({ min: 1 })
    .withMessage('At least one room is required'),
  body('semester')
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Invalid semester'),
  body('department')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Department must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if schedule already exists for the same academic year, semester, and department
    const { academic_year, semester, department } = req.body;
    const existingSchedule = await Schedule.findOne({
      academic_year: academic_year || new Date().getFullYear().toString(),
      semester,
      department,
      isActive: true
    });

    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'Active schedule already exists for this academic year, semester, and department' 
      });
    }

    const schedule = new Schedule(req.body);
    await schedule.save();

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/schedule/:id
// @desc    Update schedule
// @access  Private (Admin)
router.put('/:id', [
  adminAuth,
  body('college_time.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('College start time must be in HH:MM format'),
  body('college_time.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('College end time must be in HH:MM format'),
  body('break_.*.day')
    .optional()
    .isIn(['ALL_DAYS', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
    .withMessage('Invalid day for break'),
  body('break_.*.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Break start time must be in HH:MM format'),
  body('break_.*.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Break end time must be in HH:MM format'),
  body('semester')
    .optional()
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8'])
    .withMessage('Invalid semester'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Department must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    Object.assign(schedule, req.body);
    await schedule.save();

    res.json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/schedule/:id
// @desc    Delete schedule
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/schedule/bulk
// @desc    Create schedule from JSON data
// @access  Private (Admin)
router.post('/bulk', adminAuth, async (req, res) => {
  try {
    const scheduleData = req.body;
    
    // Validate required fields
    if (!scheduleData.college_time || !scheduleData.subjects || !scheduleData.rooms) {
      return res.status(400).json({ 
        message: 'Missing required fields: college_time, subjects, and rooms are required' 
      });
    }

    // Create schedule with default values
    const schedule = new Schedule({
      college_time: scheduleData.college_time,
      break_: scheduleData.break_ || [],
      rooms: scheduleData.rooms || [],
      academic_year: scheduleData.academic_year || new Date().getFullYear().toString(),
      semester: scheduleData.semester || '1',
      department: scheduleData.department || 'Computer Science'
    });

    await schedule.save();

    res.status(201).json({
      message: 'Schedule created successfully from bulk data',
      schedule
    });
  } catch (error) {
    console.error('Bulk schedule creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;