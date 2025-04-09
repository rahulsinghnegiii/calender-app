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
    console.log('Create event request body:', req.body);
    
    // Validate that required date fields are present and valid
    const { date, startTime, endTime } = req.body;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Date, start time, and end time are required'
      });
    }
    
    // Try to parse dates to ensure they're valid
    try {
      const parsedDate = new Date(date);
      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);
      
      // Check if any of the dates are invalid
      if (isNaN(parsedDate.getTime()) || isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format provided'
        });
      }
      
      // Use the parsed dates in the event object
      const eventData = {
        ...req.body,
        date: parsedDate,
        startTime: parsedStartTime,
        endTime: parsedEndTime
      };
      
      const event = await Event.create(eventData);
      res.status(201).json({
        success: true,
        data: event
      });
    } catch (parseError) {
      console.error('Date parsing error:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Could not parse date/time values'
      });
    }
  } catch (error) {
    console.error('Create event error:', error);
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