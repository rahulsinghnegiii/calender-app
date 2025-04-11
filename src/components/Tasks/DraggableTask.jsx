import React from 'react';
import { Draggable } from '../DndContext';
import { CheckIcon, EditIcon, DragIcon } from '../Icons/Icons';

const DraggableTask = ({ 
  task, 
  index, 
  onTaskToggle, 
  onEditTask, 
  goalColor = '#3B82F6',
  isCompleted = false
}) => {
  return (
    <Draggable 
      key={task._id} 
      draggableId={task._id} 
      index={index}
    >
      {(provided, snapshot) => (
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
      )}
    </Draggable>
  );
};

export default DraggableTask; 