const mongoose = require("mongoose");

const TimetableConfigSchema = new mongoose.Schema({
  periods_per_day: {
    type: Number,
    default: 8,
    min: 4,
    max: 12
  },
  period_duration: {
    type: Number,
    default: 50,
    min: 30,
    max: 90
  },
  college_start_time: {
    type: String,
    default: "09:30"
  },
  college_end_time: {
    type: String,
    default: "16:30"
  },
  break_periods: [{
    name: {
      type: String,
      required: true
    },
    start_time: {
      type: String,
      required: true
    },
    end_time: {
      type: String,
      required: true
    },
    applies_to: {
      type: String,
      enum: ['ALL_DAYS', 'WEEKDAYS', 'SPECIFIC'],
      default: 'ALL_DAYS'
    },
    specific_days: [{
      type: String,
      enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    }]
  }],
  special_periods: [{
    name: {
      type: String,
      required: true
    },
    day: {
      type: String,
      required: true
    },
    start_time: {
      type: String,
      required: true
    },
    end_time: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['assembly', 'event', 'meeting', 'other'],
      default: 'other'
    }
  }],
  working_days: [{
    type: String,
    enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    default: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("TimetableConfig", TimetableConfigSchema);