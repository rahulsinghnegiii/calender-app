const Event = require('../models/Event');

// Get all events
// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    // Handle optional date range filtering
    const filter = {};
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const events = await Event.find(filter).sort({ startTime: 1 });
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// Create a new event
// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    next(error);
  }
};

// Update an event
// PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    // For drag and drop operations, ensure date consistency
    if (req.body.startTime && req.body.endTime) {
      // Make sure the date part of startTime and endTime matches the event date
      const startDate = new Date(req.body.startTime);
      const endDate = new Date(req.body.endTime);
      
      // Log for debugging
      console.log('Updating event:', {
        id: req.params.id,
        date: req.body.date,
        startTime: startDate,
        endTime: endDate
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    next(error);
  }
};

// Delete an event
// DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
}; 