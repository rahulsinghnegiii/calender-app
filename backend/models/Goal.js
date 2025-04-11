const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Goal title is required'],
    trim: true
  },
  color: { 
    type: String, 
    required: [true, 'Goal color is required'],
    default: '#3B82F6' // Default blue color
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
    // Not required for now, will be used when authentication is implemented
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal; 