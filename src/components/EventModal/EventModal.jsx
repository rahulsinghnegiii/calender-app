import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { createEvent, updateEvent, deleteEvent } from '../../redux/reducers/eventSlice';
import { toggleTaskCompletion } from '../../redux/reducers/taskSlice';
import moment from 'moment';
import { formatDate, formatTime, formatTimeInternal, combineDateAndTime, roundTimeToInterval } from '../../utils/dateUtils';
import { getEventCategories } from '../../utils/eventUtils';

const EventModal = ({ isOpen, onClose, selectedSlot, selectedEvent }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = getEventCategories();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      category: 'work',
      date: '',
      startTime: '',
      endTime: ''
    }
  });

  // Set default form values based on selected slot or event
  useEffect(() => {
    if (selectedEvent) {
      // Format dates for the form inputs
      const eventDate = formatDate(selectedEvent.start);
      
      // Use formatTime for display (12-hour format) but store internal values for form submission
      const startTime = formatTime(selectedEvent.start);
      const endTime = formatTime(selectedEvent.end);
      
      reset({
        title: selectedEvent.title,
        category: selectedEvent.category,
        date: eventDate,
        startTime: startTime,
        endTime: endTime,
        // Add internal 24-hour time formats for form processing
        _startTimeInternal: formatTimeInternal(selectedEvent.start),
        _endTimeInternal: formatTimeInternal(selectedEvent.end)
      });
    } else if (selectedSlot) {
      // Round times to nearest 5-minute interval for better UX
      const roundedStart = roundTimeToInterval(selectedSlot.start, 5);
      const roundedEnd = roundTimeToInterval(selectedSlot.end, 5);
      
      const slotDate = formatDate(roundedStart);
      const startTime = formatTime(roundedStart);
      const endTime = formatTime(roundedEnd);
      
      // Check if this is a task being dropped on the calendar
      if (selectedSlot.taskData) {
        // Pre-fill with task data
        const taskTitle = selectedSlot.taskData.title || '';
        
        // Map goal color to a category if possible, or use default
        const taskCategory = mapGoalColorToCategory(selectedSlot.taskData.goalColor) || 'work';
        
        reset({
          title: taskTitle,
          category: taskCategory,
          date: slotDate,
          startTime: startTime,
          endTime: endTime,
          // Store the task ID for reference
          _taskId: selectedSlot.taskData.taskId,
          // Add internal 24-hour time formats for form processing
          _startTimeInternal: formatTimeInternal(roundedStart),
          _endTimeInternal: formatTimeInternal(roundedEnd)
        });
      } else {
        // Regular slot selection without task data
        reset({
          title: '',
          category: 'work',
          date: slotDate,
          startTime: startTime,
          endTime: endTime,
          // Add internal 24-hour time formats for form processing
          _startTimeInternal: formatTimeInternal(roundedStart),
          _endTimeInternal: formatTimeInternal(roundedEnd)
        });
      }
    }
  }, [selectedEvent, selectedSlot, reset]);

  // Helper function to map goal color to event category
  const mapGoalColorToCategory = (goalColor) => {
    // This is a simple mapping based on common colors
    // You might want to make this more sophisticated
    const colorMapping = {
      '#3B82F6': 'work',      // Blue -> Work
      '#10B981': 'exercise',  // Green -> Exercise
      '#EF4444': 'family',    // Red -> Family
      '#F59E0B': 'eating',    // Amber -> Eating
      '#8B5CF6': 'relax',     // Purple -> Relax
      '#EC4899': 'social',    // Pink -> Social
    };
    
    return colorMapping[goalColor] || 'work';
  };

  // Handle form submission
  const onSubmit = (data) => {
    setIsSubmitting(true);
    console.log('Form data:', data);
    
    try {
      // Parse the date and time correctly using Moment for consistency
      const dateStr = data.date; // YYYY-MM-DD format
      
      // Combine date and time using our utility function that handles format consistency
      const startDateTime = combineDateAndTime(dateStr, data._startTimeInternal || data.startTime);
      const endDateTime = combineDateAndTime(dateStr, data._endTimeInternal || data.endTime);
      
      // Create a clean date without time component
      const cleanDate = moment(dateStr).startOf('day').toDate();
      
      console.log('Parsed dates:', {
        date: cleanDate,
        startTime: startDateTime,
        endTime: endDateTime
      });
      
      // Validate dates are valid
      if (!moment(cleanDate).isValid() || !moment(startDateTime).isValid() || !moment(endDateTime).isValid()) {
        console.error('Invalid date format');
        setIsSubmitting(false);
        return;
      }
      
      // Ensure end time is after start time
      if (moment(endDateTime).isSameOrBefore(moment(startDateTime))) {
        alert('End time must be after start time');
        setIsSubmitting(false);
        return;
      }
      
      const eventData = {
        title: data.title,
        category: data.category,
        date: cleanDate.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };
      
      // If this event was created from a task, add a reference to the task
      if (data._taskId) {
        eventData.taskId = data._taskId;
      }
      
      console.log('Submitting event data:', eventData);
      
      if (selectedEvent) {
        // Update existing event
        dispatch(updateEvent({ 
          id: selectedEvent.id,
          eventData
        }))
          .unwrap()
          .then(() => {
            setIsSubmitting(false);
            onClose();
          })
          .catch((error) => {
            console.error('Failed to update event:', error);
            setIsSubmitting(false);
          });
      } else {
        // Create new event
        dispatch(createEvent(eventData))
          .unwrap()
          .then(() => {
            setIsSubmitting(false);
            
            // If this event was created from a task, mark the task as completed
            if (data._taskId) {
              console.log('Marking task as completed:', data._taskId);
              dispatch(toggleTaskCompletion(data._taskId))
                .catch(error => {
                  console.error('Failed to mark task as completed:', error);
                });
            }
            
            onClose();
          })
          .catch((error) => {
            console.error('Failed to create event:', error);
            setIsSubmitting(false);
          });
      }
    } catch (error) {
      console.error('Error processing form data:', error);
      setIsSubmitting(false);
    }
  };

  // Handle event deletion
  const handleDelete = () => {
    if (selectedEvent && window.confirm('Are you sure you want to delete this event?')) {
      setIsSubmitting(true);
      
      // Get the correct ID - it might be either _id or id depending on where the event came from
      const eventId = selectedEvent._id || selectedEvent.id;
      
      if (!eventId) {
        console.error('No event ID found:', selectedEvent);
        setIsSubmitting(false);
        return;
      }
      
      console.log('Deleting event with ID:', eventId);
      
      dispatch(deleteEvent(eventId))
        .unwrap()
        .then(() => {
          setIsSubmitting(false);
          onClose();
        })
        .catch((error) => {
          console.error('Failed to delete event:', error);
          setIsSubmitting(false);
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {selectedEvent ? 'Edit Event' : 'Create Event'}
          </h3>
          
          <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter event title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="text-red-500 text-xs italic">{errors.title.message}</p>}
            </div>
            
            {/* Category Select */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                {...register('category', { required: 'Category is required' })}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs italic">{errors.category.message}</p>}
            </div>
            
            {/* Date Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.date ? 'border-red-500' : ''}`}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && <p className="text-red-500 text-xs italic">{errors.date.message}</p>}
            </div>
            
            {/* Time Inputs */}
            <div className="flex mb-4 space-x-4">
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.startTime ? 'border-red-500' : ''}`}
                  {...register('startTime', { required: 'Start time is required' })}
                />
                {errors.startTime && <p className="text-red-500 text-xs italic">{errors.startTime.message}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.endTime ? 'border-red-500' : ''}`}
                  {...register('endTime', { 
                    required: 'End time is required',
                    validate: value => {
                      const { startTime } = document.forms[0];
                      return startTime.value < value || "End time must be after start time";
                    }
                  })}
                />
                {errors.endTime && <p className="text-red-500 text-xs italic">{errors.endTime.message}</p>}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6">
              {selectedEvent && (
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              )}
              <div className="flex space-x-2 ml-auto">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (selectedEvent ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal; 