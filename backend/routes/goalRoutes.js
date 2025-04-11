const express = require('express');
const router = express.Router();
const { 
  getGoals, 
  getGoal, 
  createGoal, 
  updateGoal, 
  deleteGoal,
  getGoalTasks
} = require('../controllers/goalController');

// Routes for /api/goals
router
  .route('/')
  .get(getGoals)
  .post(createGoal);

// Routes for /api/goals/:id
router
  .route('/:id')
  .get(getGoal)
  .put(updateGoal)
  .delete(deleteGoal);

// Routes for /api/goals/:goalId/tasks
router
  .route('/:goalId/tasks')
  .get(getGoalTasks);

module.exports = router; 