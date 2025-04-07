const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['exercise', 'eating', 'work', 'relax', 'family', 'social'],
    default: 'work'
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  }
}, {
  timestamps: true
});

// Virtual for full event duration
eventSchema.virtual('duration').get(function() {
  return this.endTime - this.startTime;
});

// Validation to ensure end time is after start time
eventSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

// Create index for efficient querying by date
eventSchema.index({ date: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 