const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  toggleTaskCompletion
} = require('../controllers/taskController');

// Routes for /api/tasks
router
  .route('/')
  .get(getTasks)
  .post(createTask);

// Routes for /api/tasks/:id
router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Route for toggling task completion
router
  .route('/:id/toggle')
  .patch(toggleTaskCompletion);

module.exports = router; 