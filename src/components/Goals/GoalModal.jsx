import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createGoal, updateGoal, deleteGoal } from '../../redux/reducers/goalSlice';
import { CloseIcon, TrashIcon } from '../Icons/Icons';

const colorOptions = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#000000', // Black
];

const GoalModal = ({ isOpen, onClose, goal }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!goal;
  
  // Set initial form values when editing
  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setColor(goal.color || colorOptions[0]);
    } else {
      setTitle('');
      setColor(colorOptions[0]);
    }
    setError('');
  }, [goal]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }
    
    setIsSubmitting(true);
    
    const goalData = {
      title: title.trim(),
      color
    };
    
    try {
      if (isEditing) {
        await dispatch(updateGoal({ id: goal._id, goalData })).unwrap();
      } else {
        await dispatch(createGoal(goalData)).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      setError(error.message || 'Failed to save goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle goal deletion
  const handleDelete = async () => {
    if (!isEditing) return;
    
    if (window.confirm('Are you sure you want to delete this goal? All associated tasks will also be deleted.')) {
      setIsSubmitting(true);
      
      try {
        await dispatch(deleteGoal(goal._id)).unwrap();
        onClose();
      } catch (error) {
        console.error('Error deleting goal:', error);
        setError(error.message || 'Failed to delete goal. Please try again.');
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
            {isEditing ? 'Edit Goal' : 'Create Goal'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            title="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
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
              placeholder="Enter goal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === colorOption ? 'border-indigo-500' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  title={`Select ${colorOption} color`}
                />
              ))}
            </div>
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

export default GoalModal; 