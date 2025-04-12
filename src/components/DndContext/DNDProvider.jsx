import React from 'react';
import { DragDropContext } from './index';

/**
 * DNDProvider component that wraps the application with drag and drop context
 * Handles both task and calendar event drag operations
 * Using React.forwardRef to avoid defaultProps warnings
 */
const DNDProvider = React.forwardRef(({ children, onDragEnd }, ref) => {
  /**
   * Handle drag end events for both tasks and calendar events
   * @param {Object} result - The result object from react-beautiful-dnd
   */
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return; // Dropped outside a droppable area
    }
    
    // Call the provided onDragEnd handler
    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
});

// Set display name for debugging
DNDProvider.displayName = 'ContextDNDProvider';

export default DNDProvider; 