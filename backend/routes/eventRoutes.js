const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} = require('../controllers/eventController');

// Get all events & Create new event
router
  .route('/')
  .get(getEvents)
  .post(createEvent);

// Update & Delete event
router
  .route('/:id')
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router; 