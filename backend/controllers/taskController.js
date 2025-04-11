const Task = require('../models/Task');
const Goal = require('../models/Goal');

// Get all tasks
// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    // Allow filtering by query params
    const filter = {};
    if (req.query.completed) {
      filter.completed = req.query.completed === 'true';
    }
    if (req.query.goalId) {
      filter.goalId = req.query.goalId;
    }
    
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('goalId', 'title color');
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single task
// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('goalId', 'title color');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new task
// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    // Verify the goal exists
    const goal = await Goal.findById(req.body.goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }
    
    const task = await Task.create(req.body);
    
    // Return the populated task
    const populatedTask = await Task.findById(task._id).populate('goalId', 'title color');
    
    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a task
// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    // If goalId is being updated, verify the goal exists
    if (req.body.goalId) {
      const goal = await Goal.findById(req.body.goalId);
      if (!goal) {
        return res.status(404).json({
          success: false,
          error: 'Goal not found'
        });
      }
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { 
        new: true,
        runValidators: true 
      }
    ).populate('goalId', 'title color');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a task
// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Toggle task completion status
// PATCH /api/tasks/:id/toggle
exports.toggleTaskCompletion = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Toggle completion status
    task.completed = !task.completed;
    await task.save();
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 