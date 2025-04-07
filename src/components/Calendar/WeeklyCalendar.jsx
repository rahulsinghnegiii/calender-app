import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Import DnD styles
import { fetchEvents, updateEvent } from '../../redux/reducers/eventSlice';
import EventModal from '../EventModal/EventModal';
import { getWeekRange, calculateNewTimesAfterDrag } from '../../utils/dateUtils';
import { getEventStyle, formatEventsForCalendar } from '../../utils/eventUtils';
import CustomEvent from './CustomEvent';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Create a draggable calendar component
const DnDCalendar = withDragAndDrop(Calendar);

// Custom toolbar component to be used with React Big Calendar
const CustomToolbar = ({ label, onNavigate, onView }) => {
  return (
    <div className="hidden">
      {/* We're hiding the default toolbar since we have our own in the Header component */}
    </div>
  );
};

const WeeklyCalendar = ({ currentDate, onDateChange }) => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const isLoading = useSelector((state) => state.events.isLoading);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events when current date changes
  useEffect(() => {
    const { startDate, endDate } = getWeekRange(currentDate);
    dispatch(fetchEvents({ startDate, endDate }));
  }, [dispatch, currentDate]);

  // Format events for the calendar using our utility function
  const formattedEvents = formatEventsForCalendar(events);

  // Handle slot selection (clicking on a time slot)
  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setShowModal(true);
  };

  // Handle event selection (clicking on an existing event)
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowModal(true);
  };

  // Handle moving an event (drag and drop)
  const handleEventDrop = ({ event, start, end }) => {
    // Find the original event in our store
    const originalEvent = events.find(e => e._id === event.id);
    
    if (!originalEvent) {
      console.error('Original event not found');
      return;
    }
    
    // Calculate new times based on the drag operation
    const newTimes = calculateNewTimesAfterDrag(
      new Date(originalEvent.date),
      new Date(originalEvent.startTime),
      new Date(originalEvent.endTime),
      start
    );
    
    // Create updated event object
    const updatedEvent = {
      ...originalEvent,
      date: newTimes.date,
      startTime: newTimes.startTime,
      endTime: newTimes.endTime
    };
    
    // Dispatch update action
    dispatch(updateEvent({ 
      id: event.id, 
      eventData: updatedEvent 
    }));
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  // Custom event styling based on category
  const eventStyleGetter = (event) => {
    return { style: getEventStyle(event.category) };
  };

  // Custom components for react-big-calendar
  const components = {
    toolbar: CustomToolbar,
    event: CustomEvent,
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-white p-4">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}
      
      <DnDCalendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="week"
        views={['week']}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true} // Make all events draggable
        resizable
        eventPropGetter={eventStyleGetter}
        step={30}
        timeslots={2}
        components={components}
        date={currentDate}
        onNavigate={onDateChange}
      />
      
      {showModal && (
        <EventModal 
          isOpen={showModal} 
          onClose={handleCloseModal} 
          selectedSlot={selectedSlot}
          selectedEvent={selectedEvent}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar; 