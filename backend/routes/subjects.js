const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const subjects = await Subject.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Subject.countDocuments(query);

    res.json({
      subjects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin)
router.post('/', [
  adminAuth,
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be between 2 and 20 characters'),
  body('duration')
    .isInt({ min: 30, max: 300 })
    .withMessage('Duration must be between 30 and 300 minutes'),
  body('time')
    .isInt({ min: 30, max: 300 })
    .withMessage('Time must be between 30 and 300 minutes'),
  body('no_of_classes_per_week')
    .isInt({ min: 1, max: 15 })
    .withMessage('Number of classes per week must be between 1 and 15'),
  body('faculty')
    .isArray({ min: 1 })
    .withMessage('At least one faculty member is required'),
  body('type')
    .optional()
    .isIn(['theory', 'practical', 'lab', 'tutorial'])
    .withMessage('Invalid subject type'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const subjectData = req.body;

    // Check if subject with same code already exists
    if (subjectData.code) {
      const existingSubject = await Subject.findOne({ code: subjectData.code.toUpperCase() });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this code already exists' });
      }
    }

    const subject = new Subject(subjectData);
    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin)
router.put('/:id', [
  adminAuth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be between 2 and 20 characters'),
  body('duration')
    .optional()
    .isInt({ min: 30, max: 300 })
    .withMessage('Duration must be between 30 and 300 minutes'),
  body('time')
    .optional()
    .isInt({ min: 30, max: 300 })
    .withMessage('Time must be between 30 and 300 minutes'),
  body('no_of_classes_per_week')
    .optional()
    .isInt({ min: 1, max: 15 })
    .withMessage('Number of classes per week must be between 1 and 15'),
  body('type')
    .optional()
    .isIn(['theory', 'practical', 'lab', 'tutorial'])
    .withMessage('Invalid subject type'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if updating code conflicts with existing subject
    if (req.body.code && req.body.code !== subject.code) {
      const existingSubject = await Subject.findOne({ 
        code: req.body.code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this code already exists' });
      }
    }

    Object.assign(subject, req.body);
    await subject.save();

    res.json({
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;