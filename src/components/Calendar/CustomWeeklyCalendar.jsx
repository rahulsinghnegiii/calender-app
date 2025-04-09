import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents, updateEvent } from '../../redux/reducers/eventSlice';
import { getWeekRange, calculateNewTimesAfterDrag, formatTime, getDayName } from '../../utils/dateUtils';
import moment from 'moment';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Component for displaying the day view
const DayView = ({ currentDate, events, onSlotClick, onEventClick }) => {
  const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
  
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
        {hours.map((hour, index) => {
          // Extract hour as a number (0-23)
          const hourNum = parseInt(hour.split(':')[0]);
            
          // Find events for this hour
          const hourEvents = dayEvents && Array.isArray(dayEvents) 
            ? dayEvents.filter(event => {
                const eventHour = moment(event.startTime).hour();
                return eventHour === hourNum;
              })
            : [];
          
          // Create a unique droppable ID for the day view
          const droppableId = `DAY-${moment(currentDate).format('YYYY-MM-DD')}-${hourNum}`;
          
          return (
            <div key={index} className="flex border-b h-16">
              <div className="w-16 p-2 text-right text-xs text-gray-500 border-r sticky left-0 bg-white">
                {hour}
              </div>
              <Droppable droppableId={droppableId} isDropDisabled={false}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 p-1 hover:bg-gray-50"
                    onClick={() => {
                      const startTime = moment(currentDate).startOf('day').hour(hourNum).minute(0).second(0).toDate();
                      const endTime = moment(startTime).clone().add(1, 'hour').toDate();
                      onSlotClick({ date: currentDate, start: startTime, end: endTime });
                    }}
                  >
                    {hourEvents.map((event, eventIndex) => (
                      <Draggable 
                        key={event._id || `day-event-${eventIndex}`} 
                        draggableId={event._id || `day-event-${eventIndex}`} 
                        index={eventIndex}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${getEventColorClass(event.category)} p-1 rounded text-xs mb-1 cursor-pointer overflow-hidden whitespace-nowrap ${
                              snapshot.isDragging ? 'opacity-70' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            <span className="font-semibold mr-1">{moment(event.startTime).format('HH:mm')}</span>
                            <span className="truncate">{event.title}</span>
                          </div>
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
              onClick={() => {
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
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${getEventColorClass(event.category)} p-1 rounded text-xs mb-1 truncate cursor-pointer ${
                              snapshot.isDragging ? 'opacity-70' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            {moment(event.startTime).format('HH:mm')} {event.title}
                          </div>
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

  // Hours for the time grid
  const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
  
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
    onModalOpen(slotInfo, null);
  };

  // Handle click on an event to edit it
  const handleEventClick = (event, e) => {
    if (e) e.stopPropagation();
    
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

  // Function to render events for a specific day and hour (week view)
  const renderEvents = (day, hour) => {
    const dayName = day.name;
    const hourNum = parseInt(hour.split(':')[0]);
    
    // Filter events for this day and hour
    const filteredDayEvents = filteredEvents.filter(event => {
      const eventDay = moment(event.date).format('ddd').toUpperCase();
      const eventHour = moment(event.startTime).hour();
      return eventDay === dayName && eventHour === hourNum;
    });

    // Create a unique droppable ID
    const droppableId = `${dayName}-${hourNum}`;

    return (
      <Droppable droppableId={droppableId} isDropDisabled={false}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="h-full"
            onClick={() => handleSlotClick({
              start: moment(`${moment(day.date).format('YYYY-MM-DD')} ${hourNum}:00`).toDate(),
              end: moment(`${moment(day.date).format('YYYY-MM-DD')} ${hourNum}:00`).add(1, 'hour').toDate()
            })}
          >
            {filteredDayEvents.map((event, index) => (
              <Draggable 
                key={event._id || `event-${index}`} 
                draggableId={event._id || `event-${index}`} 
                index={index}
                isDragDisabled={false}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${getEventColorClass(event.category)} p-2 rounded text-sm mt-1 cursor-pointer ${
                      snapshot.isDragging ? 'opacity-70' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, e);
                    }}
                  >
                    <div className="font-semibold">{moment(event.startTime).format('HH:mm')}</div>
                    <div>{event.title}</div>
                  </div>
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
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <div className="flex overflow-x-auto flex-1">
            {/* Time column */}
            <div className="w-16 flex-shrink-0 border-r sticky left-0 bg-white z-10">
                <div className="h-16 flex items-end justify-center text-xs text-gray-500 font-medium sticky top-0 bg-white">
                EST<br />GMT-5
              </div>
              {hours.map((hour, index) => (
                  <div key={index} className="h-16 border-t flex items-start justify-end pr-2 pt-1 text-xs text-gray-500">
                  {hour}
                </div>
              ))}
            </div>

            {/* Days columns */}
            <div className="flex flex-1 min-w-0">
              {days.map((day, dayIndex) => (
                <div key={dayIndex} className={`flex-1 min-w-[150px] ${day.highlighted ? 'bg-blue-50' : ''}`}>
                  {/* Day header */}
                  <div className="h-16 border-b border-r flex flex-col items-center justify-center sticky top-0 bg-white z-10">
                    <div className="text-xs text-gray-500">{day.name}</div>
                    <div className="text-xl font-medium">{day.number}</div>
                  </div>
                  
                  {/* Hours grid */}
                  {hours.map((hour, hourIndex) => (
                      <div key={hourIndex} className="h-16 border-t border-r relative p-1">
                      {renderEvents(day, hour)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        );
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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

        {/* Calendar View */}
        {renderCalendarView()}
      </div>
    </DragDropContext>
  );
};

export default CustomWeeklyCalendar; 