import React from 'react';
import GoalsList from '../Goals/GoalsList';
import TasksList from '../Tasks/TasksList';

const Sidebar = () => {
  return (
    <div className="h-screen bg-white border-r p-4 overflow-y-auto w-72">
      <h2 className="text-xl font-bold mb-4">Goals & Tasks</h2>
      <div className="divide-y">
        <GoalsList />
        <TasksList />
      </div>
    </div>
  );
};

export default Sidebar; 