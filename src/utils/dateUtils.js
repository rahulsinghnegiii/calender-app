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
 * Format time to 12-hour format with AM/PM
 * @param {Date} date - Date to extract time from
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return moment(date).format('h:mm A');
};

/**
 * Format time for internal use (24-hour format)
 * @param {Date} date - Date to extract time from
 * @returns {string} Formatted time string in 24-hour format
 */
export const formatTimeInternal = (date) => {
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
  // Use ISO format with the T separator between date and time
  return moment(`${dateStr}T${timeStr}`).toDate();
};

/**
 * Get a human readable representation of the event time range
 * @param {Date} startTime - Event start time
 * @param {Date} endTime - Event end time
 * @returns {string} Formatted time range string (e.g. "10:00 AM - 11:30 AM")
 */
export const getReadableTimeRange = (startTime, endTime) => {
  // Use 12-hour format with AM/PM for better readability
  const start = moment(startTime).format('h:mm A');
  const end = moment(endTime).format('h:mm A');
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
 * Format duration in a human-readable way
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g. "1h 30m" or "45m")
 */
export const formatDuration = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${minutes}m`;
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

/**
 * Round time to nearest interval (like 5 or 15 minutes)
 * @param {Date} time - Time to round
 * @param {number} intervalMinutes - Interval in minutes (default: 5)
 * @returns {Date} Rounded time
 */
export const roundTimeToInterval = (time, intervalMinutes = 5) => {
  const momentTime = moment(time);
  const minutes = momentTime.minutes();
  const roundedMinutes = Math.round(minutes / intervalMinutes) * intervalMinutes;
  return momentTime.minutes(roundedMinutes).seconds(0).milliseconds(0).toDate();
};

export default {
  formatDate,
  formatTime,
  formatTimeInternal,
  getWeekRange,
  combineDateAndTime,
  getReadableTimeRange,
  isToday,
  getDayName,
  getDurationInMinutes,
  formatDuration,
  calculateNewTimesAfterDrag,
  roundTimeToInterval
}; 