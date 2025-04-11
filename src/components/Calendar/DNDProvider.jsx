import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';

/**
 * Updated version that addresses the defaultProps warning by using
 * function default parameters instead of defaultProps
 */
function DNDProvider({ children, onDragEnd = () => {} }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}

export default DNDProvider;