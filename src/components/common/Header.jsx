import React from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { isToday } from '../../utils/dateUtils';

const Header = ({ currentDate, onDateChange }) => {
  // Navigate to today
  const goToToday = () => {
    onDateChange(new Date());
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = moment(currentDate).subtract(1, 'week').toDate();
    onDateChange(prevWeek);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeek = moment(currentDate).add(1, 'week').toDate();
    onDateChange(nextWeek);
  };

  // Format the current month and year for display
  const formattedDate = moment(currentDate).format('MMMM YYYY');

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 mr-4">Calendar App</h1>
          <span className="text-gray-500 font-medium">{formattedDate}</span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className={`${
              isToday(currentDate) 
                ? 'bg-indigo-700 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white px-4 py-2 rounded-md text-sm font-medium transition-colors`}
            onClick={goToToday}
            disabled={isToday(currentDate)}
          >
            Today
          </button>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={goToPreviousWeek}
              aria-label="Previous week"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={goToNextWeek}
              aria-label="Next week"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 