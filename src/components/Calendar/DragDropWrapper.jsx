import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';

// Modernized DragDropWrapper component that avoids the defaultProps warning in memo components
const DragDropWrapper = React.memo(({ children, onDragEnd }) => {
  // Provide a default empty function to avoid undefined prop issues
  // This addresses the defaultProps warning in memo components
  return (
    <DragDropContext onDragEnd={onDragEnd || (() => {})}>
      {children}
    </DragDropContext>
  );
});

export default DragDropWrapper;