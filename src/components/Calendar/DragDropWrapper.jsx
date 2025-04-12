import React from 'react';
import { DragDropContext } from '../DndContext';

// Modernized DragDropWrapper component that avoids the defaultProps warning
// Using React.forwardRef instead of React.memo for consistency
const DragDropWrapper = React.forwardRef(({ children, onDragEnd = () => {} }, ref) => {
  // Using our enhanced DragDropContext component that properly handles defaults
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
});

// Set display name for debugging
DragDropWrapper.displayName = 'CalendarDragDropWrapper';

export default DragDropWrapper;