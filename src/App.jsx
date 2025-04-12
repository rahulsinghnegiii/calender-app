import React, { useState } from 'react';
import CustomWeeklyCalendar from './components/Calendar/CustomWeeklyCalendar';
import EventModal from './components/EventModal/EventModal';
import Sidebar from './components/Sidebar/Sidebar';
import DragPreview from './components/Tasks/DragPreview';
import DNDProvider from './components/DndContext/DNDProvider';

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

  // Handler for drag end from tasks to calendar
  const handleDragEnd = (result) => {
    // If there's no destination, we don't need to do anything
    if (!result.destination) return;
    
    // Check if this is a task being dropped onto a calendar slot
    if (result.type === 'TASK' && result.destination.droppableId.startsWith('DAY-')) {
      // Extract task data from draggableId
      const taskId = result.draggableId.replace('task-', '');
      
      // Get the task from the DOM element's data attributes
      // This is a workaround until we have access to the task directly from Redux
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (taskElement) {
        const taskTitle = taskElement.getAttribute('data-task-title');
        const goalColor = taskElement.getAttribute('data-goal-color');
        
        // Parse the destination droppableId to get the date and time
        // Format: DAY-YYYY-MM-DD-HH-mm
        const parts = result.destination.droppableId.split('-');
        if (parts.length >= 6) {
          const year = parseInt(parts[2]);
          const month = parseInt(parts[3]) - 1; // JS months are 0-indexed
          const day = parseInt(parts[4]);
          const hour = parseInt(parts[5]);
          const minute = parseInt(parts[6] || '0');
          
          // Create date objects for the slot
          const startDate = new Date(year, month, day, hour, minute);
          const endDate = new Date(year, month, day, hour, minute + 30); // Default 30-minute duration
          
          // Create a slot object to pass to the modal
          const slotInfo = {
            date: new Date(year, month, day),
            start: startDate,
            end: endDate,
            taskData: {
              title: taskTitle,
              goalColor: goalColor,
              taskId: taskId
            }
          };
          
          // Open the event modal with the pre-filled task data
          handleModalOpen(slotInfo, null);
        }
      }
    }
  };

  return (
    <DNDProvider onDragEnd={handleDragEnd}>
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
        
        {/* Task drag layer for drag previews */}
        <DragPreview />
      </div>
    </DNDProvider>
  );
}

export default App;
