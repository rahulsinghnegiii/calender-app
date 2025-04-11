const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task title is required'],
    trim: true
  },
  goalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Goal',
    required: [true, 'Task must be associated with a goal']
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 