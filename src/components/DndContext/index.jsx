import React from 'react';
import { 
  DragDropContext as OriginalDragDropContext, 
  Droppable as OriginalDroppable, 
  Draggable as OriginalDraggable 
} from '@hello-pangea/dnd';

/**
 * Enhanced DragDropContext component that avoids React defaultProps warnings
 * Using React.forwardRef to properly handle refs
 */
export const DragDropContext = React.forwardRef(({ 
  children, 
  onDragEnd = () => {}, 
  onDragStart = undefined, 
  onDragUpdate = undefined, 
  sensors = undefined 
}, ref) => {
  // Only pass defined props to avoid defaultProps warning
  const props = {
    onDragEnd,
    ...(onDragStart !== undefined && { onDragStart }),
    ...(onDragUpdate !== undefined && { onDragUpdate }),
    ...(sensors !== undefined && { sensors })
  };
  
  return (
    <OriginalDragDropContext {...props}>
      {children}
    </OriginalDragDropContext>
  );
});

// Set display name for debugging
DragDropContext.displayName = 'EnhancedDragDropContext';

/**
 * Enhanced Droppable component that avoids React defaultProps warnings
 * Using React.forwardRef to properly handle refs
 */
export const Droppable = React.forwardRef(({ 
  children, 
  droppableId, 
  type = 'DEFAULT', 
  direction = 'vertical', 
  ignoreContainerClipping = false, 
  isDropDisabled = false, 
  isCombineEnabled = false,
  renderClone,
  shouldDisplayClone,
  getContainerForClone,
}, ref) => {
  // Only pass defined props to avoid defaultProps warning
  const props = {
    droppableId,
    type,
    direction,
    ignoreContainerClipping,
    isDropDisabled,
    isCombineEnabled,
    ...(renderClone !== undefined && { renderClone }),
    ...(shouldDisplayClone !== undefined && { shouldDisplayClone }),
    ...(getContainerForClone !== undefined && { getContainerForClone })
  };

  return (
    <OriginalDroppable {...props} ref={ref}>
      {(provided, snapshot) => children(provided, snapshot)}
    </OriginalDroppable>
  );
});

// Set display name for debugging
Droppable.displayName = 'EnhancedDroppable';

/**
 * Enhanced Draggable component that avoids React defaultProps warnings
 * Using React.forwardRef to properly handle refs
 */
export const Draggable = React.forwardRef(({ 
  children, 
  draggableId, 
  index, 
  isDragDisabled = false, 
  disableInteractiveElementBlocking = false, 
  shouldRespectForcePress = false 
}, ref) => {
  // Only pass defined props to avoid defaultProps warning
  const props = {
    draggableId,
    index,
    isDragDisabled,
    disableInteractiveElementBlocking,
    shouldRespectForcePress
  };

  return (
    <OriginalDraggable {...props} ref={ref}>
      {(provided, snapshot, rubric) => children(provided, snapshot, rubric)}
    </OriginalDraggable>
  );
});

// Set display name for debugging
Draggable.displayName = 'EnhancedDraggable';

/**
 * Simpler DragDropWrapper component for easier usage
 * Using React.forwardRef to properly handle refs
 */
export const DragDropWrapper = React.forwardRef(({ 
  children, 
  onDragEnd = () => {} 
}, ref) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
});

// Set display name for debugging
DragDropWrapper.displayName = 'EnhancedDragDropWrapper';

// Simple mock for useDragLayer to maintain API compatibility
export const useDragLayer = () => ({
  isDragging: false,
  item: null,
  currentOffset: null
});

export default {
  DragDropContext,
  Droppable,
  Draggable,
  DragDropWrapper,
  useDragLayer
}; 