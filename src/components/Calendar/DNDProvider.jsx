import React from 'react';
import { DragDropContext } from '../DndContext';

/**
 * Updated version that addresses the defaultProps warning by using
 * our enhanced DragDropContext component with React.forwardRef
 */
const DNDProvider = React.forwardRef(({ children, onDragEnd = () => {} }, ref) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
});

// Set display name for debugging
DNDProvider.displayName = 'CalendarDNDProvider';

export default DNDProvider;