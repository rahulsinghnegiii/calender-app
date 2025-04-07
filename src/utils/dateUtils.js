import moment from 'moment';

/**
 * Format date to YYYY-MM-DD format
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

/**
 * Format time to HH:mm format
 * @param {Date} date - Date to extract time from
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return moment(date).format('HH:mm');
};

/**
 * Get the start and end of a week containing the given date
 * @param {Date} date - Date within the week
 * @returns {Object} Object containing startDate and endDate
 */
export const getWeekRange = (date) => {
  const startDate = moment(date).startOf('week').toISOString();
  const endDate = moment(date).endOf('week').toISOString();
  return { startDate, endDate };
};

/**
 * Combine date string and time string into a Date object
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:mm format
 * @returns {Date} Combined date and time as Date object
 */
export const combineDateAndTime = (dateStr, timeStr) => {
  return moment(`${dateStr} ${timeStr}`).toDate();
};

/**
 * Get a human readable representation of the event time range
 * @param {Date} startTime - Event start time
 * @param {Date} endTime - Event end time
 * @returns {string} Formatted time range string (e.g. "10:00 - 11:30")
 */
export const getReadableTimeRange = (startTime, endTime) => {
  const start = moment(startTime).format('HH:mm');
  const end = moment(endTime).format('HH:mm');
  return `${start} - ${end}`;
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} Whether the date is today
 */
export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Get day name from date
 * @param {Date} date - Date to get day name from
 * @returns {string} Day name (e.g. "Monday")
 */
export const getDayName = (date) => {
  return moment(date).format('dddd');
};

/**
 * Get the duration between two dates in minutes
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {number} Duration in minutes
 */
export const getDurationInMinutes = (startTime, endTime) => {
  return moment(endTime).diff(moment(startTime), 'minutes');
};

/**
 * Calculate new date and times after drag and drop
 * @param {Date} originalDate - Original event date
 * @param {Date} originalStart - Original start time
 * @param {Date} originalEnd - Original end time
 * @param {Date} newStart - New start time after drag
 * @returns {Object} Object with new date, start and end times
 */
export const calculateNewTimesAfterDrag = (originalDate, originalStart, originalEnd, newStart) => {
  // Calculate the duration of the event
  const durationMinutes = getDurationInMinutes(originalStart, originalEnd);
  
  // Calculate the new end time based on the duration
  const newEnd = moment(newStart).add(durationMinutes, 'minutes').toDate();
  
  // Extract just the date part from the new start time
  const newDate = moment(newStart).startOf('day').toDate();
  
  return {
    date: newDate,
    startTime: newStart,
    endTime: newEnd
  };
};

export default {
  formatDate,
  formatTime,
  getWeekRange,
  combineDateAndTime,
  getReadableTimeRange,
  isToday,
  getDayName,
  getDurationInMinutes,
  calculateNewTimesAfterDrag
}; 