/**
 * Color configuration for event categories
 */
export const categoryColors = {
  exercise: { 
    backgroundColor: '#4CAF50', 
    borderColor: '#2E7D32',
    textColor: 'white',
    title: 'Exercise'
  },
  eating: { 
    backgroundColor: '#FF9800', 
    borderColor: '#EF6C00',
    textColor: 'white',
    title: 'Eating'
  },
  work: { 
    backgroundColor: '#2196F3', 
    borderColor: '#1565C0',
    textColor: 'white',
    title: 'Work'
  },
  relax: { 
    backgroundColor: '#9C27B0', 
    borderColor: '#6A1B9A',
    textColor: 'white',
    title: 'Relax'
  },
  family: { 
    backgroundColor: '#F44336', 
    borderColor: '#C62828',
    textColor: 'white',
    title: 'Family'
  },
  social: { 
    backgroundColor: '#00BCD4', 
    borderColor: '#00838F',
    textColor: 'white',
    title: 'Social'
  },
};

/**
 * Get style object for an event based on its category
 * @param {string} category - Event category
 * @returns {Object} Style object for the event
 */
export const getEventStyle = (category) => {
  const defaultColors = { backgroundColor: '#2196F3', borderColor: '#1565C0', textColor: 'white' };
  const colors = categoryColors[category] || defaultColors;
  
  return {
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    color: colors.textColor,
    borderWidth: '2px',
    borderRadius: '4px',
    opacity: 0.8,
    display: 'block',
    overflow: 'hidden',
  };
};

/**
 * Get all available event categories
 * @returns {Array} Array of category objects with value and label
 */
export const getEventCategories = () => {
  return Object.keys(categoryColors).map(key => ({
    value: key,
    label: categoryColors[key].title
  }));
};

/**
 * Format events for the calendar
 * @param {Array} events - Events from API/Redux store
 * @returns {Array} Formatted events for react-big-calendar
 */
export const formatEventsForCalendar = (events) => {
  return events.map(event => ({
    id: event._id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    category: event.category,
    allDay: false,
  }));
};

/**
 * Get a readable category name
 * @param {string} categoryKey - Category key
 * @returns {string} Category title
 */
export const getCategoryTitle = (categoryKey) => {
  return categoryColors[categoryKey]?.title || categoryKey;
};

export default {
  categoryColors,
  getEventStyle,
  getEventCategories,
  formatEventsForCalendar,
  getCategoryTitle
}; 