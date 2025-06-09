const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Room name must be at least 1 character long'],
    maxlength: [20, 'Room name cannot exceed 20 characters']
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500']
  },
  type: {
    type: String,
    enum: ['classroom', 'laboratory', 'auditorium', 'seminar_hall'],
    default: 'classroom'
  },
  equipment: [{
    type: String,
    trim: true
  }],
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for efficient queries (removed duplicate index for 'name' since it's already unique)
roomSchema.index({ type: 1 });
roomSchema.index({ building: 1 });

module.exports = mongoose.model('Room', roomSchema);