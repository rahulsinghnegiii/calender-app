import React from 'react';
// Using our improved custom hook implementation
import { useDragLayer } from '../DndContext/dragLayerContext';

/**
 * Drag layer component for tasks
 * This shows a preview of the task being dragged
 */
const DragPreview = () => {
  // Use our enhanced useDragLayer hook to get drag state
  const { isDragging, item, currentOffset } = useDragLayer(state => ({
    isDragging: state.isDragging,
    item: state.item,
    currentOffset: state.currentOffset
  }));

  // Only show the drag layer when dragging is active
  if (!isDragging || !currentOffset) {
    return null;
  }

  const getItemStyle = () => {
    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;
    return {
      transform,
      WebkitTransform: transform,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '250px',
      pointerEvents: 'none',
      zIndex: 1000,
    };
  };

  return (
    <div style={getItemStyle()} className="drag-layer">
      <div className="p-2 rounded-md border border-indigo-300 bg-indigo-50 shadow-md flex items-center">
        <span className="ml-6 truncate">{item?.title || 'Task'}</span>
      </div>
    </div>
  );
};

export default DragPreview; 