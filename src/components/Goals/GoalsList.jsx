import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGoals, setSelectedGoal, selectAllGoals, selectGoalIsLoading, selectSelectedGoal } from '../../redux/reducers/goalSlice';
import { PlusIcon } from '../Icons/Icons'; // We'll create this later
import GoalModal from './GoalModal'; // We'll create this later

const GoalsList = () => {
  const dispatch = useDispatch();
  const goals = useSelector(selectAllGoals);
  const isLoading = useSelector(selectGoalIsLoading);
  const selectedGoal = useSelector(selectSelectedGoal);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Fetch goals on component mount
  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  // Handle goal selection
  const handleGoalSelect = (goal) => {
    dispatch(setSelectedGoal(goal));
  };

  // Open modal to create a new goal
  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  // Open modal to edit an existing goal
  const handleEditGoal = (goal, e) => {
    e.stopPropagation();
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="goals-list mt-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Goals</h3>
        <button
          onClick={handleAddGoal}
          className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
          title="Add new goal"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg border-gray-300">
          <p className="text-gray-500">No goals added yet</p>
          <button
            onClick={handleAddGoal}
            className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600 transition-colors"
          >
            Add Your First Goal
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li 
              key={goal._id}
              className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                selectedGoal && selectedGoal._id === goal._id
                  ? 'bg-indigo-100 border-l-4 border-indigo-500'
                  : 'hover:bg-gray-100 border-l-4 border-transparent'
              }`}
              onClick={() => handleGoalSelect(goal)}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: goal.color }}
                ></div>
                <span>{goal.title}</span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => handleEditGoal(goal, e)}
                title="Edit goal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {isModalOpen && (
        <GoalModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          goal={editingGoal}
        />
      )}
    </div>
  );
};

export default GoalsList; 