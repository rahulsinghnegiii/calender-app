import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents, updateEvent } from '../../redux/reducers/eventSlice';
import { getWeekRange, calculateNewTimesAfterDrag, formatTime, getDayName } from '../../utils/dateUtils';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable, DragDropWrapper } from '../DndContext';
import ResizableEvent from './ResizableEvent';

// Component for displaying the day view
const DayView = ({ currentDate, events, onSlotClick, onEventClick }) => {
  // Generate time slots for every 15 minutes instead of hourly
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Create moment object for consistent formatting
        const timeObj = moment().hour(hour).minute(minute).second(0);
        
        // Format for internal use and display
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        
        // Add metadata to each slot for better rendering
        slots.push({
          // Format in both 12-hour and 24-hour for flexibility
          label: `${hourFormatted}:${minuteFormatted}`,
          
          // Always use 12-hour format with AM/PM for consistency
          displayLabel: timeObj.format('h:mm A'),
          
          // Time components for calculations
          hour,
          minute,
          
          // Flags for styling and time increments
          isFullHour: minute === 0,
          isHalfHour: minute === 30,
          isQuarterHour: minute === 15 || minute === 45
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Filter events for the current day
  const dayEvents = events && Array.isArray(events) 
    ? events.filter(event => moment(event.date).isSame(moment(currentDate), 'day'))
    : [];
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="text-center py-4 border-b font-medium text-lg sticky top-0 bg-white z-10">
        {moment(currentDate).format('dddd, MMMM D, YYYY')}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {timeSlots.map((timeSlot, index) => {
          // Extract hour and minute as numbers
          const hour = timeSlot.hour;
          const minute = timeSlot.minute;
          
          // Show full hour labels, but smaller height for 15/30/45-minute slots
          // h-16 = 64px (full hour), h-4 = 16px (15-min slot)
          // These heights MUST match the values used in ResizableEvent.jsx for accurate event sizing
          const isFullHour = timeSlot.isFullHour;
          const isHalfHour = timeSlot.isHalfHour;
          const isQuarterHour = timeSlot.isQuarterHour;
          const slotHeight = isFullHour ? 'h-16' : 'h-4';
          
          // Find events that start at this time slot
          const slotEvents = dayEvents && Array.isArray(dayEvents) 
            ? dayEvents.filter(event => {
            const eventHour = moment(event.startTime).hour();
                const eventMinute = moment(event.startTime).minute();
                return eventHour === hour && eventMinute === minute;
              })
            : [];
          
          // Create a unique droppable ID for the day view
          const droppableId = `DAY-${moment(currentDate).format('YYYY-MM-DD')}-${hour}-${minute}`;
          
          return (
            <div key={index} className={`flex border-b ${slotHeight} ${
              isFullHour ? 'border-gray-300' : 
              isHalfHour ? 'border-dashed border-gray-300' : 
              'border-dotted border-gray-200'}`}>
              {isFullHour && (
                <div className="w-20 p-2 text-right text-xs text-gray-700 font-semibold border-r sticky left-0 bg-white">
                  {timeSlot.displayLabel}
              </div>
              )}
              {isHalfHour && (
                <div className="w-20 py-1 text-right text-[10px] text-gray-600 border-r sticky left-0 bg-white">
                  {timeSlot.displayLabel}
                </div>
              )}
              {isQuarterHour && (
                <div className="w-20 py-1 text-right text-[9px] text-gray-500 border-r sticky left-0 bg-white">
                  {timeSlot.displayLabel}
                </div>
              )}
              {!isFullHour && !isHalfHour && !isQuarterHour && (
                <div className="w-20 py-1 text-right text-[9px] text-gray-400 border-r sticky left-0 bg-white">
                  {timeSlot.displayLabel}
                </div>
              )}
              <Droppable droppableId={droppableId} isDropDisabled={false}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-1 hover:bg-blue-50 relative ${
                      isFullHour ? 'hover:before:content-["Click_to_create_event"] hover:before:absolute hover:before:text-[10px] hover:before:text-blue-500 hover:before:font-medium hover:before:right-2 hover:before:top-1' : 
                      isHalfHour ? 'hover:before:content-["' + timeSlot.displayLabel + '"] hover:before:absolute hover:before:text-[9px] hover:before:text-blue-500 hover:before:font-medium hover:before:right-2 hover:before:top-0' : 
                      ''
                    }`}
                    onClick={(e) => {
                      // Check if any resize operation is in progress
                      const isResizing = document.querySelector('.z-10.shadow-lg') !== null;
                      
                      // Don't open modal if resizing is in progress
                      if (isResizing) {
                        e.stopPropagation();
                        return;
                      }
                      
                      const startTime = moment(currentDate).hour(hour).minute(minute).second(0).toDate();
                      // Create a default duration of 30 minutes for full hour and half hour slots, 15 minutes for others
                      const duration = isFullHour || isHalfHour ? 30 : 15;
                      const endTime = moment(startTime).clone().add(duration, 'minutes').toDate();
                      onSlotClick({ date: currentDate, start: startTime, end: endTime });
                    }}
                  >
                    {slotEvents.map((event, eventIndex) => (
                      <Draggable 
                        key={event._id || `day-event-${eventIndex}`} 
                        draggableId={event._id || `day-event-${eventIndex}`} 
                        index={eventIndex}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <ResizableEvent
                            event={event}
                            onEventClick={onEventClick}
                            isInDayView={true}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Get category color for an event - Moving this to the top level so it's accessible to all components
const getEventColorClass = (category) => {
  const colors = {
    exercise: 'bg-green-100 border-l-4 border-green-400',
    eating: 'bg-yellow-100 border-l-4 border-yellow-400',
    work: 'bg-blue-100 border-l-4 border-blue-400',
    relax: 'bg-purple-100 border-l-4 border-purple-400',
    family: 'bg-red-100 border-l-4 border-red-400',
    social: 'bg-pink-100 border-l-4 border-pink-400',
  };
  return colors[category] || 'bg-gray-100 border-l-4 border-gray-400';
};

// Component for displaying the month view
const MonthView = ({ currentDate, events, onSlotClick, onEventClick }) => {
  // Calculate the first day of the month
  const firstDay = moment(currentDate).startOf('month');
  
  // Calculate the first day of the calendar (might be in the previous month)
  const firstCalendarDay = moment(firstDay).startOf('week');
  
  // Create an array of 42 days (6 weeks)
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = moment(firstCalendarDay).add(i, 'days');
    
    // Check if this day is in the current month
    const isCurrentMonth = day.month() === moment(currentDate).month();
    
    // Check if this day is today
    const isToday = day.isSame(moment(), 'day');
    
    return {
      date: day.toDate(),
      day: day.date(),
      isCurrentMonth,
      isToday
    };
  });
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="text-center py-4 border-b font-medium text-lg">
        {moment(currentDate).format('MMMM YYYY')}
      </div>
      
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-center py-2 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {days.map((day, index) => {
          // Filter events for this day
          const dayEvents = events && Array.isArray(events) 
            ? events.filter(event => moment(event.date).isSame(moment(day.date), 'day'))
            : [];
          
          // Create a unique droppable ID for this day in the month view
          const droppableId = `MONTH-${moment(day.date).format('YYYY-MM-DD')}`;
          
          return (
            <div 
              key={index} 
              className={`border-b border-r p-1 min-h-[100px] flex flex-col ${
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${day.isToday ? 'bg-blue-50' : ''}`}
              onClick={(e) => {
                // Check if any resize operation is in progress
                const isResizing = document.querySelector('.z-10.shadow-lg') !== null;
                
                // Don't open modal if resizing is in progress
                if (isResizing) {
                  e.stopPropagation();
                  return;
                }
                
                const startTime = moment(day.date).hour(9).minute(0).second(0).toDate();
                const endTime = moment(startTime).clone().add(1, 'hour').toDate();
                onSlotClick({ date: day.date, start: startTime, end: endTime });
              }}
            >
              <div className="text-right p-1">
                <span className={`inline-block rounded-full w-6 h-6 text-center ${
                  day.isToday ? 'bg-blue-500 text-white' : ''
                }`}>
                  {day.day}
                </span>
              </div>
              <Droppable droppableId={droppableId} isDropDisabled={false}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1"
                  >
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <Draggable 
                        key={event._id || `month-event-${eventIndex}`} 
                        draggableId={event._id || `month-event-${eventIndex}`} 
                        index={eventIndex}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <ResizableEvent
                            event={event}
                            onEventClick={onEventClick}
                            isInDayView={false}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Component for displaying the year view
const YearView = ({ currentDate, onDateChange }) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = moment(currentDate).month(i);
    return {
      name: month.format('MMMM'),
      date: month.toDate(),
      isCurrentMonth: month.month() === moment().month() && month.year() === moment().year()
    };
  });
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="text-center py-4 border-b font-medium text-xl">
        {moment(currentDate).format('YYYY')}
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {months.map((month, index) => (
          <div 
            key={index} 
            className={`p-4 border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer ${
              month.isCurrentMonth ? 'bg-blue-50 border-blue-300' : ''
            }`}
            onClick={() => onDateChange(month.date)}
          >
            <div className="text-center font-medium">{month.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main calendar component
const CustomWeeklyCalendar = ({ currentDate, onDateChange, onModalOpen, currentView, onViewChange }) => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events) || [];
  const isLoading = useSelector((state) => state.events.isLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Fetch events when current date changes
  useEffect(() => {
    // Adjust date range based on current view
    let startDate, endDate;
    
    switch (currentView) {
      case 'day':
        startDate = moment(currentDate).startOf('day').toISOString();
        endDate = moment(currentDate).endOf('day').toISOString();
        break;
      case 'month':
        startDate = moment(currentDate).startOf('month').startOf('week').toISOString();
        endDate = moment(currentDate).endOf('month').endOf('week').toISOString();
        break;
      case 'year':
        startDate = moment(currentDate).startOf('year').toISOString();
        endDate = moment(currentDate).endOf('year').toISOString();
        break;
      case 'week':
      default:
        const weekRange = getWeekRange(currentDate);
        startDate = weekRange.startDate;
        endDate = weekRange.endDate;
    }
    
    dispatch(fetchEvents({ startDate, endDate }));
  }, [dispatch, currentDate, currentView]);

  // Filter events when search term or events change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events || []);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = events && Array.isArray(events) 
      ? events.filter(event => {
      return (
        event.title.toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term) ||
        moment(event.startTime).format('YYYY-MM-DD HH:mm').includes(term)
      );
        })
      : [];
    
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Generate days of the week with their corresponding dates
  const generateDays = () => {
    const startOfWeek = moment(currentDate).startOf('week');
    return Array.from({ length: 7 }, (_, i) => {
      const day = moment(startOfWeek).add(i, 'days');
      const isToday = moment().isSame(day, 'day');
      return {
        name: day.format('ddd').toUpperCase(),
        number: day.format('D'),
        date: day.toDate(),
        highlighted: isToday
      };
    });
  };

  const days = generateDays();

  // Generate time slots for every 15 minutes for the week view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Create a moment object for consistent time formatting
        const timeObj = moment().hour(hour).minute(minute).second(0);
        
        // Format for internal use (24-hour format) and display (12-hour format)
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        
        slots.push({
          // Use 24-hour format for internal handling
          label: `${hourFormatted}:${minuteFormatted}`,
          
          // Use 12-hour AM/PM format for display, with special handling for different minute values
          displayLabel: minute === 0 
            ? timeObj.format('h:mm A') 
            : minute === 30 
              ? timeObj.format('h:mm A')
              : timeObj.format('h:mm A'),
              
          // Full labels for tooltips and accessibility
          fullLabel: `${hourFormatted}:${minuteFormatted}`,
          displayFullLabel: timeObj.format('h:mm A'), 
          
          // Time components for calculations
          hour: hour,
          minute: minute,
          
          // Flags for styling
          isFullHour: minute === 0,
          isHalfHour: minute === 30,
          isQuarterHour: minute === 15 || minute === 45
        });
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Navigate to previous period
  const goToPrevious = () => {
    let newDate;
    
    switch (currentView) {
      case 'day':
        newDate = moment(currentDate).subtract(1, 'day').toDate();
        break;
      case 'month':
        newDate = moment(currentDate).subtract(1, 'month').toDate();
        break;
      case 'year':
        newDate = moment(currentDate).subtract(1, 'year').toDate();
        break;
      case 'week':
      default:
        newDate = moment(currentDate).subtract(1, 'week').toDate();
    }
    
    onDateChange(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    let newDate;
    
    switch (currentView) {
      case 'day':
        newDate = moment(currentDate).add(1, 'day').toDate();
        break;
      case 'month':
        newDate = moment(currentDate).add(1, 'month').toDate();
        break;
      case 'year':
        newDate = moment(currentDate).add(1, 'year').toDate();
        break;
      case 'week':
      default:
        newDate = moment(currentDate).add(1, 'week').toDate();
    }
    
    onDateChange(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    onDateChange(new Date());
  };

  // Handle click on a time slot to create a new event
  const handleSlotClick = (slotInfo) => {
    // Check if any resize operation is in progress by looking for elements with z-10 and shadow-lg classes
    // which are applied during resizing
    const isResizing = document.querySelector('.z-10.shadow-lg') !== null;

    // Don't open modal if resizing is in progress
    if (isResizing) {
      console.log('Resize operation in progress, ignoring slot click');
      return;
    }

    // Ensure dates are in proper format
    const formattedSlot = {
      ...slotInfo,
      date: slotInfo.date ? moment(slotInfo.date).startOf('day').toDate() : moment().startOf('day').toDate(),
      start: slotInfo.start ? moment(slotInfo.start).toDate() : null,
      end: slotInfo.end ? moment(slotInfo.end).toDate() : null
    };
    
    // Round times to nearest 5-minute interval for better UX
    if (formattedSlot.start) {
      const startMinutes = moment(formattedSlot.start).minutes();
      const roundedStartMinutes = Math.round(startMinutes / 5) * 5;
      formattedSlot.start = moment(formattedSlot.start).minutes(roundedStartMinutes).seconds(0).milliseconds(0).toDate();
      
      // If end time exists, ensure it's also rounded and at least 15 minutes after start
      if (formattedSlot.end) {
        const minDuration = 15; // Minimum duration in minutes
        const endMinutes = moment(formattedSlot.end).minutes();
        const roundedEndMinutes = Math.round(endMinutes / 5) * 5;
        
        // Create a properly rounded end time
        const roundedEnd = moment(formattedSlot.end).minutes(roundedEndMinutes).seconds(0).milliseconds(0);
        
        // Ensure end time is at least minDuration minutes after start time
        const minEndTime = moment(formattedSlot.start).add(minDuration, 'minutes');
        
        formattedSlot.end = moment.max(roundedEnd, minEndTime).toDate();
      }
    }
    
    onModalOpen(formattedSlot, null);
  };

  // Handle click on an event to edit it
  const handleEventClick = (event, e) => {
    if (e) e.stopPropagation();
    
    // Check if any resize operation is in progress
    const isResizing = document.querySelector('.z-10.shadow-lg') !== null;
    
    // Don't open modal if resizing is in progress
    if (isResizing) {
      console.log('Resize operation in progress, ignoring event click');
      return;
    }
    
    // Create a properly structured event object with normalized date properties
    const formattedEvent = {
      id: event._id,
      _id: event._id,
      title: event.title,
      category: event.category,
      start: moment(event.startTime).toDate(),
      end: moment(event.endTime).toDate(),
      date: moment(event.date).startOf('day').toDate(),
      // Include original timestamps for reference
      startTime: moment(event.startTime).toDate(),
      endTime: moment(event.endTime).toDate()
    };
    
    onModalOpen(null, formattedEvent);
  };

  // Handle drag end for events (applies to all views)
  const handleDragEnd = (result) => {
    if (!result.destination) return; // Drop outside droppable area
    
    const { source, destination, draggableId } = result;
    
    // Handle task drops from sidebar to calendar
    if (draggableId.startsWith('task-')) {
      // Extract the task ID from the draggableId (format: "task-{taskId}")
      const taskId = draggableId.replace('task-', '');
      
      // Get task data from Redux store
      const allTasks = useSelector(state => state.tasks.tasks);
      const task = allTasks.find(t => t._id === taskId);
      
      if (!task) return; // Task not found
      
      // Get the goal associated with the task to use its color
      const allGoals = useSelector(state => state.goals.goals);
      const goal = allGoals.find(g => g._id === task.goalId);
      
      // Parse the destination.droppableId to get date and time
      // Format could be: "DAY-YYYY-MM-DD-HH-MM" for day view or "{DAY_NAME}-{HOUR}-{MINUTE}" for week view
      const destinationParts = destination.droppableId.split('-');
      
      let eventDate, eventStartTime, eventEndTime;
      
      if (destination.droppableId.startsWith('DAY-')) {
        // Day view format: DAY-YYYY-MM-DD-HH-MM
        const dateString = `${destinationParts[1]}-${destinationParts[2]}-${destinationParts[3]}`;
        const hour = parseInt(destinationParts[4]);
        const minute = parseInt(destinationParts[5] || '0');
        
        eventDate = moment(dateString).toDate();
        eventStartTime = moment(eventDate).hour(hour).minute(minute).second(0).toDate();
        // Default duration of 30 minutes
        eventEndTime = moment(eventStartTime).add(30, 'minutes').toDate();
      } else if (destinationParts.length >= 3) {
        // Week view format: {DAY_NAME}-{HOUR}-{MINUTE}
        const dayName = destinationParts[0];
        const hour = parseInt(destinationParts[1]);
        const minute = parseInt(destinationParts[2]);
        
        // Find the date from the days array
        const day = days.find(d => d.name === dayName);
        
        if (day) {
          eventDate = day.date;
          eventStartTime = moment(eventDate).hour(hour).minute(minute).second(0).toDate();
          // Default duration of 30 minutes
          eventEndTime = moment(eventStartTime).add(30, 'minutes').toDate();
        }
      } else {
        // Couldn't parse droppable ID format
        console.error('Invalid droppable ID format:', destination.droppableId);
        return;
      }
      
      if (eventDate && eventStartTime && eventEndTime) {
        // Create event data from task
        const eventData = {
          title: task.title,
          // Map the task's goal category to an event category if possible, otherwise use a default
          category: goal ? mapGoalCategoryToEventCategory(goal.color) : 'work',
          date: moment(eventDate).startOf('day').toDate(),
          startTime: eventStartTime,
          endTime: eventEndTime
        };
        
        // Open the modal with pre-populated data
        onModalOpen({
          date: moment(eventDate).format('YYYY-MM-DD'),
          start: eventStartTime,
          end: eventEndTime,
          title: task.title,
          category: eventData.category
        }, null);
      }
      
      return;
    }
    
    // Handle regular event drag and drop
    if (!events || !Array.isArray(events)) return;
    
    const eventId = draggableId.includes('event-') ? 
      parseInt(draggableId.split('-').pop()) : 
      draggableId;
    
    // Find the event
    let event;
    if (draggableId.includes('event-')) {
      // Find event by index in a specific view
      const sourceId = source.droppableId;
      
      if (sourceId.startsWith('DAY-')) {
        // Day view format: DAY-YYYY-MM-DD-HH
        const parts = sourceId.split('-');
        const sourceDate = moment(`${parts[1]}-${parts[2]}-${parts[3]}`).toDate();
        const sourceHour = parseInt(parts[4]);
        
        // Find all events for this day and hour
        const sourceEvents = events.filter(e => 
          moment(e.date).isSame(moment(sourceDate), 'day') && 
          moment(e.startTime).hour() === sourceHour
        );
        
        event = sourceEvents[source.index];
      } else if (sourceId.includes('-')) {
        // Week view format: DAY-HH
        const [sourceDay, sourceHour] = sourceId.split('-');
        const day = days.find(d => d.name === sourceDay);
        
        if (!day) return;
        
        // Find events for this day and hour
        const sourceEvents = events.filter(e => {
          const eventDay = moment(e.date).format('ddd').toUpperCase();
          const eventHour = moment(e.startTime).hour();
          return eventDay === sourceDay && eventHour === parseInt(sourceHour);
        });
        
        event = sourceEvents[source.index];
      }
    } else {
      // Find event directly by ID
      event = events.find(e => e._id === eventId);
    }
    
    if (!event) {
      console.error('Event not found for draggableId:', draggableId);
      return;
    }
    
    // Parse destination droppable ID to get new date and time
    const destId = destination.droppableId;
    let newStart;
    
    if (destId.startsWith('DAY-')) {
      // Day view format: DAY-YYYY-MM-DD-HH
      const parts = destId.split('-');
      const destDate = moment(`${parts[1]}-${parts[2]}-${parts[3]}`).toDate();
      const destHour = parseInt(parts[4]);
      const destMinute = parseInt(parts[5] || '0');
      
      newStart = moment(destDate).hour(destHour).minute(destMinute).second(0).toDate();
    } else if (destId.includes('-')) {
      // Week view format: DAY-HH-MM
      const destParts = destId.split('-');
      const destDay = destParts[0];
      const destHour = parseInt(destParts[1]);
      const destMinute = parseInt(destParts[2] || '0');
      
      // Find the date from the days array
      const day = days.find(d => d.name === destDay);
      
      if (!day) return;
      
      newStart = moment(day.date).hour(destHour).minute(destMinute).second(0).toDate();
    } else {
      return;
    }
    
    // Calculate new times
    const { date: newDate, startTime: newStartTime, endTime: newEndTime } = 
      calculateNewTimesAfterDrag(event.date, event.startTime, event.endTime, newStart);
    
    // Update the event
    const updatedEvent = {
      ...event,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    };
    
    // Dispatch the update
    dispatch(updateEvent({
      id: event._id,
      eventData: updatedEvent
    }));
  };
  
  // Helper function to map goal color to an event category
  const mapGoalCategoryToEventCategory = (goalColor) => {
    // Map color to category - this can be customized based on your app's color scheme
    const colorMap = {
      '#3B82F6': 'work',      // Blue
      '#10B981': 'exercise',  // Green
      '#EF4444': 'family',    // Red
      '#F59E0B': 'eating',    // Amber
      '#8B5CF6': 'relax',     // Purple
      '#EC4899': 'social',    // Pink
      '#6B7280': 'work',      // Gray
      '#000000': 'work'       // Black
    };
    
    return colorMap[goalColor] || 'work'; // Default to work category if no match
  };

  // Render the appropriate view based on currentView
  const renderCalendarView = () => {
    switch (currentView) {
      case 'day':
        return (
          <DayView 
            currentDate={currentDate} 
            events={filteredEvents} 
            onSlotClick={handleSlotClick} 
            onEventClick={handleEventClick} 
          />
        );
      case 'month':
        return (
          <MonthView 
            currentDate={currentDate} 
            events={filteredEvents} 
            onSlotClick={handleSlotClick} 
            onEventClick={handleEventClick} 
          />
        );
      case 'year':
        return (
          <YearView 
            currentDate={currentDate} 
            onDateChange={(date) => {
              onDateChange(date);
              onViewChange('month');
            }} 
          />
        );
      case 'week':
      default:
        return (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex overflow-x-auto">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 border-r sticky left-0 bg-white z-10">
                <div className="h-16 flex items-end justify-center text-xs text-gray-500 font-medium sticky top-0 bg-white">
                EST<br />GMT-5
              </div>
                {timeSlots.map((slot, index) => (
                  <div 
                    key={index} 
                    className={`${slot.isFullHour ? 'h-16 border-t border-gray-300' : 'h-4'} 
                                ${slot.isFullHour ? '' : 
                                  slot.isHalfHour ? 'border-t border-dashed border-gray-300' : 
                                  slot.isQuarterHour ? 'border-t-0 border-dotted border-gray-200' :
                                  'border-t-0'} 
                                flex items-start justify-end pr-2 pt-1 
                                ${slot.isFullHour ? 'text-xs font-semibold text-gray-700' : 
                                  slot.isHalfHour ? 'text-[10px] text-gray-600' : 
                                  slot.isQuarterHour ? 'text-[9px] text-gray-500' :
                                  'text-[9px] text-gray-400'}`}
                  >
                    {slot.isFullHour ? slot.displayLabel : slot.label}
                </div>
              ))}
            </div>

            {/* Days columns */}
              <div className="flex flex-1">
              {days.map((day, dayIndex) => (
                <div key={dayIndex} className={`flex-1 min-w-[150px] ${day.highlighted ? 'bg-blue-50' : ''}`}>
                  {/* Day header */}
                  <div className="h-16 border-b border-r flex flex-col items-center justify-center sticky top-0 bg-white z-10">
                    <div className="text-xs text-gray-500">{day.name}</div>
                    <div className="text-xl font-medium">{day.number}</div>
                  </div>
                  
                    {/* Time slots grid */}
                    {timeSlots.map((slot, slotIndex) => {
                      // Create a unique droppable ID
                      const droppableId = `${day.name}-${slot.hour}-${slot.minute}`;
                      
                      return (
                        <div 
                          key={slotIndex} 
                          className={`${slot.isFullHour ? 'h-16 border-t border-gray-300' : 'h-4'} 
                                      ${slot.isFullHour ? '' : 
                                        slot.isHalfHour ? 'border-t border-dashed border-gray-300' : 
                                        slot.isQuarterHour ? 'border-t border-dotted border-gray-200' :
                                        'border-t-0 border-dotted'} 
                                      border-r`}
                        >
                          <Droppable droppableId={droppableId} direction="vertical" type="EVENT">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="h-full w-full relative p-1"
                                style={{
                                  minHeight: slot.isFullHour ? '4rem' : '1rem',
                                  backgroundColor: snapshot.isDraggingOver ? 'rgba(235, 244, 255, 0.8)' : 'transparent'
                                }}
                                onClick={(e) => {
                                  // Check if any resize operation is in progress
                                  const isResizing = document.querySelector('.z-10.shadow-lg') !== null;
                                  
                                  // Don't open modal if resizing is in progress
                                  if (isResizing) {
                                    e.stopPropagation();
                                    return;
                                  }
                                  
                                  // Create more appropriate default durations based on the time slot
                                  const startTime = moment(day.date).hour(slot.hour).minute(slot.minute).second(0).toDate();
                                  const duration = slot.isFullHour || slot.isHalfHour ? 30 : 15;
                                  const endTime = moment(startTime).clone().add(duration, 'minutes').toDate();
                                  
                                  handleSlotClick({
                                    date: moment(day.date).format('YYYY-MM-DD'),
                                    start: startTime,
                                    end: endTime
                                  });
                                }}
                                onMouseEnter={(e) => {
                                  // Add visual feedback for time slot hovering with more accurate time display
                                  const currentTarget = e.currentTarget;
                                  if (currentTarget) {
                                    const date = moment(day.date).format('MMM D');
                                    currentTarget.title = `Create event on ${date} at ${slot.displayFullLabel}`;
                                  }
                                }}
                              >
                                {filteredEvents
                                  .filter(event => {
                                    const eventDay = moment(event.date).format('ddd').toUpperCase();
                                    const eventHour = moment(event.startTime).hour();
                                    const eventMinute = moment(event.startTime).minute();
                                    return eventDay === day.name && eventHour === slot.hour && eventMinute === slot.minute;
                                  })
                                  .map((event, index) => (
                                    <Draggable 
                                      key={event._id || `event-${index}`} 
                                      draggableId={event._id || `event-${index}`} 
                                      index={index}
                                      isDragDisabled={false}
                                    >
                                      {(provided, snapshot) => (
                                        <ResizableEvent
                                          event={event}
                                          onEventClick={handleEventClick}
                                          isInDayView={false}
                                          provided={provided}
                                          snapshot={snapshot}
                                        />
                                      )}
                                    </Draggable>
                                  ))
                                }
                                {provided.placeholder}
                    </div>
                            )}
                          </Droppable>
                    </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
        );
    }
  };

  return (
      <div className="w-full h-screen bg-white shadow">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-4">
            <button 
              className="p-1 rounded hover:bg-gray-100"
              onClick={goToPrevious}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="font-medium hover:bg-gray-100 px-3 py-1 rounded"
              onClick={goToToday}
            >
              Today
            </button>
            <button 
              className="p-1 rounded hover:bg-gray-100"
              onClick={goToNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="font-semibold">
              {currentView === 'day' ? moment(currentDate).format('MMMM D, YYYY') : 
               currentView === 'week' ? moment(currentDate).format('MMMM YYYY') :
               currentView === 'month' ? moment(currentDate).format('MMMM YYYY') :
               moment(currentDate).format('YYYY')}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-1 rounded ${currentView === 'day' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => onViewChange('day')}
            >
              Day
            </button>
            <button 
              className={`px-4 py-1 rounded ${currentView === 'week' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => onViewChange('week')}
            >
              Week
            </button>
            <button 
              className={`px-4 py-1 rounded ${currentView === 'month' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => onViewChange('month')}
            >
              Month
            </button>
            <button 
              className={`px-4 py-1 rounded ${currentView === 'year' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
              onClick={() => onViewChange('year')}
            >
              Year
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              className="pl-8 pr-10 py-1 border rounded-md bg-gray-100 w-64"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2 top-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search results indicator */}
        {searchTerm && (
          <div className="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-b flex justify-between items-center">
            <div>
              Showing <span className="font-semibold">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'result' : 'results'} for "<span className="font-semibold">{searchTerm}</span>"
            </div>
            <button 
              onClick={clearSearch}
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              Clear search
            </button>
          </div>
        )}

      {/* Calendar View with DragDropWrapper */}
      <DragDropWrapper onDragEnd={handleDragEnd}>
        {renderCalendarView()}
      </DragDropWrapper>
      </div>
  );
};

export default CustomWeeklyCalendar; 