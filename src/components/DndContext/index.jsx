import React from 'react';
import { 
  DragDropContext as OriginalDragDropContext, 
  Droppable as OriginalDroppable, 
  Draggable as OriginalDraggable 
} from '@hello-pangea/dnd';
// Import our custom hook implementation
import { useDragLayer } from './hooks';

/**
 * Enhanced DragDropContext component that avoids React defaultProps warnings
 * Using function default parameters instead of defaultProps
 */
export function DragDropContext({ 
  children, 
  onDragEnd = () => {}, 
  onDragStart = undefined, 
  onDragUpdate = undefined, 
  sensors = undefined 
}) {
  return (
    <OriginalDragDropContext 
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      sensors={sensors}
    >
      {children}
    </OriginalDragDropContext>
  );
}

/**
 * Enhanced Droppable component that avoids React defaultProps warnings
 * Using function default parameters instead of defaultProps
 */
export function Droppable({ 
  children, 
  droppableId, 
  type = 'DEFAULT', 
  direction = 'vertical', 
  ignoreContainerClipping = false, 
  isDropDisabled = false, 
  isCombineEnabled = false, 
  renderClone = undefined, 
  shouldDisplayClone = undefined 
}) {
  return (
    <OriginalDroppable
      droppableId={droppableId}
      type={type}
      direction={direction}
      ignoreContainerClipping={ignoreContainerClipping}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      renderClone={renderClone}
      shouldDisplayClone={shouldDisplayClone}
    >
      {children}
    </OriginalDroppable>
  );
}

/**
 * Enhanced Draggable component that avoids React defaultProps warnings
 * Using function default parameters instead of defaultProps
 */
export function Draggable({ 
  children, 
  draggableId, 
  index, 
  isDragDisabled = false, 
  disableInteractiveElementBlocking = false, 
  shouldRespectForcePress = false 
}) {
  return (
    <OriginalDraggable
      draggableId={draggableId}
      index={index}
      isDragDisabled={isDragDisabled}
      disableInteractiveElementBlocking={disableInteractiveElementBlocking}
      shouldRespectForcePress={shouldRespectForcePress}
    >
      {children}
    </OriginalDraggable>
  );
}

/**
 * Simpler DragDropWrapper component for easier usage
 * Using function default parameters
 */
export function DragDropWrapper({ children, onDragEnd = () => {} }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  );
}

// Export our simplified useDragLayer hook
export { useDragLayer };

export default {
  DragDropContext,
  Droppable,
  Draggable,
  DragDropWrapper,
  useDragLayer
}; 