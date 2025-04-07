import React, { useState } from 'react';
import CustomWeeklyCalendar from './components/Calendar/CustomWeeklyCalendar';
import EventModal from './components/EventModal/EventModal';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('week'); // Add view state: 'day', 'week', 'month', 'year'

  // Handler for date changes
  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  // Handler for view changes
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Handle modal open and close
  const handleModalOpen = (slot, event) => {
    setSelectedSlot(slot);
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      {/* Using our custom calendar with the modern Google Calendar look */}
      <CustomWeeklyCalendar 
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onModalOpen={handleModalOpen}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      {/* Event modal for creating/editing events */}
      {showModal && (
        <EventModal 
          isOpen={showModal} 
          onClose={handleModalClose} 
          selectedSlot={selectedSlot}
          selectedEvent={selectedEvent}
        />
      )}
    </div>
  );
}

export default App;
