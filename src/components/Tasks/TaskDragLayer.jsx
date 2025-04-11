import React from 'react';
// Using our custom hook implementation
import { useDragLayer } from '../DndContext/hooks';

/**
 * Drag layer component for tasks
 * Note: This is currently a non-functional placeholder since our useDragLayer
 * implementation is simplified. In a complete implementation, this would show
 * a preview of the task being dragged.
 */
const TaskDragLayer = () => {
  // Our custom hook will always return isDragging: false
  const dragState = useDragLayer();
  const { isDragging, item, currentOffset } = dragState;

  // This will always return null with our simplified hook
  if (!isDragging || !currentOffset) {
    return null;
  }

  // The code below is kept for reference but won't execute
  const getItemStyle = () => {
    const transform = `translate(${currentOffset?.x || 0}px, ${currentOffset?.y || 0}px)`;
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
        <span className="ml-6 truncate">{item?.content?.title || 'Task'}</span>
      </div>
    </div>
  );
};

export default TaskDragLayer; 