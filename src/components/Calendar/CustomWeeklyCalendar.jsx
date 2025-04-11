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
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        // Convert to moment object for consistent formatting
        const timeObj = moment().hour(hour).minute(minute).second(0);
        
        // Add metadata to each slot for better rendering
        slots.push({
          // Format in both 12-hour and 24-hour for flexibility
          label: `${hourFormatted}:${minuteFormatted}`,
          displayLabel: timeObj.format('h:mm A'), // 12-hour with AM/PM
          hour,
          minute,
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
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        // Create a moment object for consistent time formatting
        const timeObj = moment().hour(hour).minute(minute).second(0);
        
        slots.push({
          // Use 24-hour format for internal handling
          label: minute === 0 ? `${hourFormatted}:${minuteFormatted}` : `${minuteFormatted}`,
          // Use 12-hour AM/PM format for display
          displayLabel: minute === 0 ? timeObj.format('h:mm A') : timeObj.format('mm'),
          fullLabel: `${hourFormatted}:${minuteFormatted}`,
          displayFullLabel: timeObj.format('h:mm A'), 
          hour: hour,
          minute: minute,
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

    // Ensure dates are in proper ISO format
    const formattedSlot = {
      ...slotInfo,
      date: slotInfo.date ? moment(slotInfo.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      start: slotInfo.start ? moment(slotInfo.start).toDate() : null,
      end: slotInfo.end ? moment(slotInfo.end).toDate() : null
    };
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
    
    // Create a properly structured event object with both id and _id for compatibility
    const formattedEvent = {
      id: event._id,
      _id: event._id,
      title: event.title,
      category: event.category,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      date: new Date(event.date)
    };
    
    onModalOpen(null, formattedEvent);
  };

  // Handle drag end for events (applies to all views)
  const handleDragEnd = (result) => {
    if (!result.destination || !events || !Array.isArray(events)) return;
    
    const { source, destination } = result;
    const eventId = result.draggableId;
    
    // Handle both _id and generated ids (event-index format)
    let event;
    if (eventId.startsWith('day-event-') || eventId.startsWith('month-event-')) {
      const index = parseInt(eventId.split('-').pop());
      
      // Find the event based on the source droppable ID
      const sourceId = source.droppableId;
      let sourceDate;
      let sourceHourNum;
      
      // Parse the source information based on the view
      if (sourceId.startsWith('DAY-')) {
        // Day view format: DAY-YYYY-MM-DD-HH
        const parts = sourceId.split('-');
        sourceDate = moment(`${parts[1]}-${parts[2]}-${parts[3]}`).toDate();
        sourceHourNum = parseInt(parts[4]);
        
        // Find all events for this day and hour
        const sourceEvents = events && Array.isArray(events) 
          ? events.filter(e => {
          return moment(e.date).isSame(moment(sourceDate), 'day') && 
                 moment(e.startTime).hour() === sourceHourNum;
            })
          : [];
        
        event = sourceEvents[source.index];
      } else if (sourceId.startsWith('MONTH-')) {
        // Month view format: MONTH-YYYY-MM-DD
        const parts = sourceId.split('-');
        sourceDate = moment(`${parts[1]}-${parts[2]}-${parts[3]}`).toDate();
        
        // Find all events for this day
        const sourceEvents = events && Array.isArray(events) 
          ? events.filter(e => moment(e.date).isSame(moment(sourceDate), 'day'))
          : [];
        
        event = sourceEvents[source.index];
      } else if (sourceId.includes('-')) {
        // Week view format: DAY-HH
        const [sourceDay, sourceHour] = sourceId.split('-');
        sourceHourNum = parseInt(sourceHour);
        sourceDate = days.find(d => d.name === sourceDay)?.date;
        
        if (!sourceDate) return;
        
        // Find events for this day and hour
        const sourceEvents = events && Array.isArray(events) 
          ? events.filter(e => {
          const eventDay = moment(e.date).format('ddd').toUpperCase();
          const eventHour = moment(e.startTime).hour();
          return eventDay === sourceDay && eventHour === sourceHourNum;
            })
          : [];
        
        event = sourceEvents[source.index];
      }
    } else {
      event = events.find(e => e._id === eventId);
    }
    
    if (!event) {
      console.error('No event found for draggable ID:', eventId);
      return;
    }
    
    // Process the destination based on its droppable ID format
    const destId = destination.droppableId;
    let destDate;
    let destHour = 0;
    
    if (destId.startsWith('DAY-')) {
      // Day view: DAY-YYYY-MM-DD-HH
      const parts = destId.split('-');
      destDate = moment(`${parts[1]}-${parts[2]}-${parts[3]}`).toDate();
      destHour = parseInt(parts[4]);
    } else if (destId.startsWith('MONTH-')) {
      // Month view: MONTH-YYYY-MM-DD
      const parts = destId.split('-');
      destDate = moment(`${parts[1]}-${parts[2]}-${parts[3]}`).toDate();
      // For month view, we keep the same hour but change the date
      destHour = moment(event.startTime).hour();
    } else if (destId.includes('-')) {
      // Week view: DAY-HH
      const [destDay, destHourStr] = destId.split('-');
      destDate = days.find(d => d.name === destDay)?.date;
      if (!destDate) return;
      destHour = parseInt(destHourStr);
    } else {
      console.error('Unknown destination format:', destId);
      return;
    }
    
    // Keep the same duration
    const duration = moment(event.endTime).diff(moment(event.startTime), 'minutes');
    
    // Calculate new start and end times
    const newStartTime = moment(destDate).hour(destHour).minute(0).second(0).toDate();
    const newEndTime = moment(newStartTime).add(duration, 'minutes').toDate();
    
    // Create updated event object
    const updatedEvent = {
      ...event,
      date: moment(destDate).startOf('day').toDate(),
      startTime: newStartTime,
      endTime: newEndTime
    };
    
    // Dispatch update action
    dispatch(updateEvent({ 
      id: event._id, 
      eventData: updatedEvent 
    }));
  };

  // Function to render events for a specific day and time slot (week view)
  const renderEvents = (day, timeSlot) => {
    const dayName = day.name;
    const hour = timeSlot.hour;
    const minute = timeSlot.minute;
    
    // Filter events for this day and time slot
    // Modified to only include events that START at this exact time slot
    const filteredSlotEvents = filteredEvents.filter(event => {
      const eventDay = moment(event.date).format('ddd').toUpperCase();
      const eventHour = moment(event.startTime).hour();
      const eventMinute = moment(event.startTime).minute();
      return eventDay === dayName && eventHour === hour && eventMinute === minute;
    });

    // Create a unique droppable ID
    const droppableId = `${dayName}-${hour}-${minute}`;

    return (
      <Droppable droppableId={droppableId} isDropDisabled={false}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="h-full w-full relative"
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
            onMouseEnter={() => {
              // Add visual feedback for time slot hovering
              if (slot.isFullHour || slot.isHalfHour) {
                const currentTarget = event.currentTarget;
                if (currentTarget) {
                  currentTarget.title = `Create event at ${slot.fullLabel}`;
                }
              }
            }}
          >
            {filteredSlotEvents.map((event, index) => (
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
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
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