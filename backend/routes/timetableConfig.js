const express = require('express');
const TimetableConfig = require('../models/TimetableConfig');
const auth = require('../middleware/auth');

const router = express.Router();

// Get timetable configuration
router.get('/', async (req, res) => {
  try {
    let config = await TimetableConfig.findOne();
    if (!config) {
      // Create default config if none exists
      config = new TimetableConfig({
        periods_per_day: 8,
        period_duration: 50,
        college_start_time: "09:30",
        college_end_time: "16:30",
        break_periods: [{
          name: "Lunch Break",
          start_time: "13:00",
          end_time: "14:00",
          applies_to: "ALL_DAYS"
        }],
        working_days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      });
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update timetable configuration
router.put('/', async (req, res) => {
  try {
    const {
      periods_per_day,
      period_duration,
      college_start_time,
      college_end_time,
      break_periods,
      special_periods,
      working_days
    } = req.body;

    let config = await TimetableConfig.findOne();
    if (!config) {
      config = new TimetableConfig();
    }

    config.periods_per_day = periods_per_day || config.periods_per_day;
    config.period_duration = period_duration || config.period_duration;
    config.college_start_time = college_start_time || config.college_start_time;
    config.college_end_time = college_end_time || config.college_end_time;
    config.break_periods = break_periods || config.break_periods;
    config.special_periods = special_periods || config.special_periods;
    config.working_days = working_days || config.working_days;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;