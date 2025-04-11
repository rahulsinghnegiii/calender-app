import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateEvent } from '../../redux/reducers/eventSlice';
import moment from 'moment';

// Global variable to track resize operations
// This is used to prevent the modal from opening during resize
window.preventModalFromOpening = false;

// Utility function to get event color class based on category
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

const ResizableEvent = ({ 
  event, 
  onEventClick, 
  isInDayView = false, 
  provided, 
  snapshot 
}) => {
  const dispatch = useDispatch();
  const [isResizing, setIsResizing] = useState(false);
  const [initialY, setInitialY] = useState(0);
  const [initialHeight, setInitialHeight] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [resizeEndTime, setResizeEndTime] = useState(null);
  const [isResizeOperation, setIsResizeOperation] = useState(false);
  const [timeSnapped, setTimeSnapped] = useState(false); // Track if time snapped for feedback
  const eventRef = useRef(null);

  // Calculate event height based on duration and match the calendar's slot heights
  const startTime = moment(event.startTime);
  const endTime = moment(event.endTime);
  const durationMinutes = endTime.diff(startTime, 'minutes');
  
  // In the calendar, full hour (h-16) is 64px and 15-min (h-4) is 16px
  // This means 1 minute is approximately 1.067px (64px ÷ 60min)
  const fullHourHeight = 64; // matches h-16 in Tailwind
  const quarterHourHeight = 16; // matches h-4 in Tailwind
  const minutePixelRatio = fullHourHeight / 60; // Exactly how many pixels per minute (1.067px)
  
  // Calculate height based on duration - more precisely using the exact pixel-to-minute ratio
  // This makes events visually proportional to their actual duration
  const calculatedHeight = durationMinutes * minutePixelRatio;
  
  // Ensure minimum height of 20px for visibility of very short events (less than 15 minutes)
  const slotHeight = Math.max(20, calculatedHeight);

  // Initialize currentHeight when event changes
  useEffect(() => {
    setCurrentHeight(slotHeight);
  }, [slotHeight, event._id]);

  // Update end time display during resizing
  useEffect(() => {
    // Only needed when resizing is active
    if (!isResizing) return;
    
    // Calculate the new duration based on current height using the precise pixel-to-minute ratio
    const newDurationMinutes = Math.max(5, Math.round(currentHeight / minutePixelRatio));
    
    // Snap to nearest 5-minute increment for better UX
    const snappedMinutes = Math.round(newDurationMinutes / 5) * 5;
    
    // Create new end time based on start time + new duration
    const newEndTime = moment(event.startTime).add(snappedMinutes, 'minutes').toDate();
    
    // Update end time state if different
    if (!resizeEndTime || !moment(resizeEndTime).isSame(moment(newEndTime))) {
      setResizeEndTime(newEndTime);
      setTimeSnapped(true); // Indicate successful snap for feedback
      
      // Reset the indicator after a brief delay
      setTimeout(() => setTimeSnapped(false), 500);
    }
  }, [currentHeight, isResizing, event.startTime, minutePixelRatio]);

  // Handle mouse down on resize handle
  const handleResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Set global flag to track resize state globally
    window.calendarResizing = true;
    
    setIsResizing(true);
    setIsResizeOperation(true); // Mark that we're starting a resize operation
    setInitialY(e.clientY);
    setInitialHeight(eventRef.current.offsetHeight);
    
    // Add event listeners to track mouse movement
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle mouse movement during resize
  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    // Calculate new height based on mouse movement
    const deltaY = e.clientY - initialY;
    const newHeight = Math.max(20, initialHeight + deltaY);
    setCurrentHeight(newHeight);
    
    // Calculate new end time based on height change using the precise pixel-to-minute ratio
    const heightDiffInMinutes = Math.round(deltaY / minutePixelRatio);
    
    // Calculate new end time based on original end time plus the height difference in minutes
    // Snap to 5-minute increments for better usability
    const snappedMinutes = Math.round(heightDiffInMinutes / 5) * 5;
    const newEndTime = moment(event.endTime).add(snappedMinutes, 'minutes').toDate();
    
    // Only update if different from current resizeEndTime to prevent constant rerenders
    if (!resizeEndTime || !moment(resizeEndTime).isSame(moment(newEndTime), 'minute')) {
      setResizeEndTime(newEndTime);
    }

    // Snap height to a precise time increment after a short delay for smoother UX
    snapToTimeGrid(newHeight);
  };

  // Snap height to the nearest time increment for more precise alignment
  const snapToTimeGrid = (height) => {
    // Calculate how many minutes the height represents using the exact pixel-to-minute ratio
    const minutes = Math.round(height / minutePixelRatio);
    
    // Snap to 5-minute increments for better usability
    const snappedMinutes = Math.round(minutes / 5) * 5;
    
    // Calculate the snapped height using the precise ratio (must be at least 20px for visibility)
    const snappedHeight = Math.max(20, snappedMinutes * minutePixelRatio);
    
    // Only apply if different from current height (prevent infinite loop)
    if (Math.abs(snappedHeight - currentHeight) > 2) {
      setTimeout(() => {
        setCurrentHeight(snappedHeight);
      }, 50); // Small delay for smoother UX
    }
  };

  // Handle mouse up to finish resizing
  const handleResizeEnd = (e) => {
    if (!isResizing) return;
    
    // If there's an event, prevent its propagation to parent elements
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    setIsResizing(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    // If the end time has changed, update the event
    if (resizeEndTime && !moment(resizeEndTime).isSame(moment(event.endTime))) {
      const updatedEvent = {
        ...event,
        endTime: resizeEndTime
      };
      
      dispatch(updateEvent({
        id: event._id,
        eventData: updatedEvent
      }));
    }
    
    // Reset resize end time
    setResizeEndTime(null);
    
    // Use a short timeout to ensure click events can't trigger immediately after resize
    setTimeout(() => {
      window.isCalendarResizing = false;
      setIsResizeOperation(false); // Mark that we're done with resize operation
    }, 200); // Slightly longer timeout to ensure all click events are processed
  };

  // Format time range for display with improved accuracy
  const formatTimeRange = () => {
    // Use consistent time format for better readability
    const startFormat = 'h:mm';
    const endFormat = 'h:mm A'; // Only show AM/PM on end time to save space
    
    const start = moment(event.startTime).format(startFormat);
    const end = moment(resizeEndTime || event.endTime).format(endFormat);
    
    return `${start} – ${end}`;
  };

  // Format duration text for display - make more precise
  const formatDuration = () => {
    if (durationMinutes >= 60) {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${durationMinutes}m`;
  };

  // Calculate duration during resize for more accurate feedback
  const getResizeDuration = () => {
    if (!resizeEndTime) return durationMinutes;
    const mins = moment(resizeEndTime).diff(moment(event.startTime), 'minutes');
    // Round to nearest minute for accuracy
    return Math.round(mins);
  };

  // Get a more accurate duration display during resize
  const getCurrentDuration = () => {
    const mins = isResizing ? getResizeDuration() : durationMinutes;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    return `${mins}m`;
  };

  // Determine if this is a short event (less than 30 minutes)
  const isShortEvent = durationMinutes < 30;
  
  // Generate time label classes based on resize state and event duration
  const timeLabelClasses = isResizing 
    ? `font-semibold text-[10px] bg-white bg-opacity-85 px-1 py-0.5 rounded text-blue-800 shadow-sm ${timeSnapped ? 'animate-pulse' : ''}`
    : `font-semibold text-[10px] ${isShortEvent ? 'bg-white bg-opacity-80' : 'bg-white bg-opacity-70'} px-1 py-0.5 rounded-sm text-gray-800`;

  // Format the end time to show during resize
  const formattedEndTime = moment(resizeEndTime || event.endTime).format(isResizing ? 'h:mm:ss A' : 'h:mm A');

  return (
    <div
      ref={(node) => {
        // Apply both refs - the draggable ref from dnd and our local ref
        provided.innerRef(node);
        eventRef.current = node;
      }}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`${getEventColorClass(event.category)} p-1 rounded text-xs mb-1 cursor-pointer overflow-hidden relative ${
        snapshot.isDragging ? 'opacity-70' : ''
      } ${isResizing ? 'z-10 shadow-lg' : ''}`}
      style={{ 
        height: isResizing ? `${currentHeight}px` : `${slotHeight}px`,
        minHeight: '20px', // Ensure it's at least visible
        transition: isResizing ? 'none' : 'height 0.1s ease', // Smooth transition when not resizing
        ...provided.draggableProps.style // Include the style from draggable
      }}
      onClick={(e) => {
        // Prevent click event handling if we're in a resize operation
        if (isResizeOperation) {
          e.stopPropagation();
          return;
        }
        
        e.stopPropagation();
        onEventClick(event, e);
      }}
      title={`${formatTimeRange()} (${getCurrentDuration()})`} // Enhanced tooltip with precise duration
    >
      {/* Time label at the top with accurate range */}
      <div className="flex items-center justify-between mb-1">
        <div className={timeLabelClasses}>
          {formatTimeRange()}
        </div>
        {(!isShortEvent || isResizing) && (
          <div className={`text-[9px] ${isResizing ? 'text-blue-700 font-semibold bg-white bg-opacity-80 px-1 rounded' : 'text-gray-600 font-medium'}`}>
            {getCurrentDuration()}
          </div>
        )}
      </div>

      {/* Event title */}
      <div className="truncate font-medium">{event.title}</div>
      
      {/* Show end time for events longer than 30 minutes and improve visibility during resize */}
      {(!isShortEvent || isResizing) && durationMinutes >= 30 && (
        <div className={`absolute bottom-0 right-0 p-1 
          ${isResizing 
            ? 'text-[10px] font-bold bg-white bg-opacity-90 text-blue-700 rounded-tl-sm shadow-sm' 
            : 'text-[9px] font-medium bg-white bg-opacity-70 text-gray-700 rounded-tl-sm'}`}>
          {formattedEndTime}
        </div>
      )}
      
      {/* Improved resize handle with better visual feedback */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-2.5 ${isResizing ? 'bg-blue-200' : 'bg-gray-300'} 
          cursor-ns-resize hover:bg-blue-300 z-10 transition-colors duration-150`}
        onMouseDown={(e) => {
          // Explicitly stop propagation to ensure the event doesn't bubble up
          e.stopPropagation();
          e.preventDefault();
          
          // Start resize operation
          handleResizeStart(e);
        }}
        onClick={(e) => {
          // Completely prevent click events on the resize handle
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div className={`w-8 h-1 ${isResizing ? 'bg-blue-500' : 'bg-gray-500'} mx-auto rounded-full mt-0.5 transition-colors`}></div>
      </div>
      
      {/* Enhanced display during resize for precise feedback */}
      {isResizing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm text-[10px] font-bold text-blue-800 ${timeSnapped ? 'ring-2 ring-blue-400' : ''}`}>
            {getCurrentDuration()} ({formattedEndTime})
          </div>
        </div>
      )}
    </div>
  );
};

export default ResizableEvent; 