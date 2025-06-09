const express = require('express');
const { body, validationResult } = require('express-validator');
const Faculty = require('../models/Faculty');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/faculty
// @desc    Get all faculty
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query.department = { $regex: department, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const faculty = await Faculty.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Faculty.countDocuments(query);

    res.json({
      faculty,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculty/:id
// @desc    Get faculty by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty
// @desc    Create new faculty
// @access  Private (Admin)
router.post('/', [
  adminAuth,
  body('id')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Faculty ID must be between 1 and 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Faculty name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department name cannot exceed 50 characters'),
  body('availability')
    .isArray()
    .withMessage('Availability must be an array'),
  body('availability.*.day')
    .isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
    .withMessage('Invalid day'),
  body('availability.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if faculty with same ID already exists
    const existingFaculty = await Faculty.findOne({ id: req.body.id });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this ID already exists' });
    }

    const faculty = new Faculty(req.body);
    await faculty.save();

    res.status(201).json({
      message: 'Faculty created successfully',
      faculty
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Faculty with this ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/faculty/:id
// @desc    Update faculty
// @access  Private (Admin)
router.put('/:id', [
  adminAuth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Faculty name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Department name cannot exceed 50 characters'),
  body('availability.*.day')
    .optional()
    .isIn(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])
    .withMessage('Invalid day'),
  body('availability.*.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.*.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const faculty = await Faculty.findOne({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    Object.assign(faculty, req.body);
    await faculty.save();

    res.json({
      message: 'Faculty updated successfully',
      faculty
    });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete faculty
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    await Faculty.deleteOne({ _id: faculty._id });

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculty/:id/availability
// @desc    Get faculty availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ]
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({
      faculty: {
        id: faculty.id,
        name: faculty.name
      },
      availability: faculty.availability
    });
  } catch (error) {
    console.error('Get faculty availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;