import React, { useState } from 'react';
import CustomWeeklyCalendar from './components/Calendar/CustomWeeklyCalendar';
import EventModal from './components/EventModal/EventModal';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState('week'); // Add view state: 'day', 'week', 'month', 'year'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Control sidebar visibility
  
  // Handler for toggling sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div className="h-screen w-screen overflow-hidden bg-white flex">
      {/* Sidebar with Goals and Tasks */}
      {isSidebarOpen && <Sidebar />}
      
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Sidebar toggle button */}
        <div className="p-2 border-b">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* Using our custom calendar with the modern Google Calendar look */}
        <div className="flex-1 overflow-hidden">
          <CustomWeeklyCalendar 
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onModalOpen={handleModalOpen}
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>
      
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
