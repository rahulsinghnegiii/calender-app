import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask, deleteTask } from '../../redux/reducers/taskSlice';
import { selectGoalById } from '../../redux/reducers/goalSlice';
import { CloseIcon, TrashIcon } from '../Icons/Icons';

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

const TaskModal = ({ isOpen, onClose, task, goalId }) => {
  const dispatch = useDispatch();
  const goal = useSelector((state) => selectGoalById(state, goalId));
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!task;
  
  // Set initial form values when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setPriority('medium');
      setDueDate('');
    }
    setError('');
  }, [task]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    setIsSubmitting(true);
    
    const taskData = {
      title: title.trim(),
      priority,
      goalId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null
    };
    
    try {
      if (isEditing) {
        await dispatch(updateTask({ id: task._id, taskData })).unwrap();
      } else {
        await dispatch(createTask(taskData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(error.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle task deletion
  const handleDelete = async () => {
    if (!isEditing) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsSubmitting(true);
      
      try {
        await dispatch(deleteTask(task._id)).unwrap();
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
        setError(error.message || 'Failed to delete task. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            title="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        {goal && (
          <div className="mb-4 flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: goal.color }}
            ></div>
            <span className="text-sm text-gray-500">
              Goal: {goal.title}
            </span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-md border ${
                    priority === option.value 
                      ? `${option.color} text-white` 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPriority(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
              Due Date (Optional)
            </label>
            <input
              type="date"
              id="dueDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            {isEditing && (
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </button>
            )}
            
            <div className={`${isEditing ? 'ml-auto' : ''}`}>
              <button
                type="button"
                className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 