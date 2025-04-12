import React, { useCallback } from 'react';
import { Draggable } from '../DndContext';
import { useDragLayerUpdater } from '../DndContext/dragLayerContext';
import { CheckIcon, EditIcon, DragIcon } from '../Icons/Icons';

const DraggableTask = ({ 
  task, 
  index, 
  onTaskToggle, 
  onEditTask, 
  goalColor = '#3B82F6',
  isCompleted = false
}) => {
  // Get the drag layer update functions
  const { startDrag, endDrag } = useDragLayerUpdater();
  
  // Create handlers for drag start and end
  const handleDragStart = useCallback((start) => {
    // Create task data for the drag preview
    const taskData = {
      id: task._id,
      title: task.title,
      goalColor,
      type: 'task'
    };
    
    // Get position from drag start event if available
    const position = start?.client || { x: 0, y: 0 };
    
    // Update the drag layer state
    startDrag(taskData, position);
  }, [task, goalColor, startDrag]);
  
  const handleDragEnd = useCallback(() => {
    // Clear the drag layer when drag ends
    endDrag();
  }, [endDrag]);
  
  return (
    <Draggable 
      key={task._id} 
      draggableId={`task-${task._id}`}
      index={index}
    >
      {(provided, snapshot) => {
        // Call handlers when drag state changes
        if (snapshot.isDragging && !snapshot.isDropAnimating) {
          handleDragStart(provided.draggableProps.data);
        } else if (!snapshot.isDragging && snapshot.draggingOver === null) {
          handleDragEnd();
        }
        
        return (
          <li
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`p-2 rounded-md border ${
              snapshot.isDragging 
                ? 'border-indigo-300 bg-indigo-50 shadow-md' 
                : isCompleted
                  ? 'border-gray-200 bg-gray-50 text-gray-500'
                  : 'border-gray-200'
            } flex items-center justify-between`}
            style={{
              ...provided.draggableProps.style,
              borderLeft: `4px solid ${goalColor}`
            }}
            data-task-id={task._id}
            data-goal-color={goalColor}
            data-task-title={task.title}
          >
            <div className="flex items-center flex-1">
              <div {...provided.dragHandleProps} className="cursor-move mr-2 text-gray-400">
                <DragIcon className="w-4 h-4" />
              </div>
              <button
                className={`w-5 h-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                  isCompleted 
                    ? 'border-green-500 bg-green-500 flex items-center justify-center text-white' 
                    : 'border-gray-300 hover:border-indigo-500'
                }`}
                onClick={() => onTaskToggle(task._id)}
                title={isCompleted ? "Mark as incomplete" : "Mark as completed"}
              >
                {isCompleted && <CheckIcon className="w-3 h-3" />}
              </button>
              <span className={`flex-1 truncate ${isCompleted ? 'line-through' : ''}`}>
                {task.title}
              </span>
            </div>
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={(e) => onEditTask(task, e)}
              title="Edit task"
            >
              <EditIcon className="w-4 h-4" />
            </button>
          </li>
        );
      }}
    </Draggable>
  );
};

export default DraggableTask; 