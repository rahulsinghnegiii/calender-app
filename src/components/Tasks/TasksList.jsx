import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, toggleTaskCompletion } from '../../redux/reducers/taskSlice';
import { selectSelectedGoal } from '../../redux/reducers/goalSlice';
import { Droppable } from '../DndContext';
import { PlusIcon } from '../Icons/Icons';
import TaskModal from './TaskModal';
import DraggableTask from './DraggableTask';

const TasksList = () => {
  const dispatch = useDispatch();
  const selectedGoal = useSelector(selectSelectedGoal);
  const tasks = useSelector((state) => state.tasks.tasks);
  const isLoading = useSelector((state) => state.tasks.isLoading);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Fetch tasks when the selected goal changes
  useEffect(() => {
    if (selectedGoal) {
      dispatch(fetchTasks({ goalId: selectedGoal._id }));
    }
  }, [dispatch, selectedGoal]);
  
  // Handle task checkbox toggle
  const handleTaskToggle = (taskId) => {
    dispatch(toggleTaskCompletion(taskId));
  };
  
  // Open modal to create a new task
  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };
  
  // Open modal to edit an existing task
  const handleEditTask = (task, e) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsModalOpen(true);
  };
  
  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };
  
  // Separate tasks into completed and incomplete
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  if (!selectedGoal) {
    return (
      <div className="tasks-list mt-6 text-center py-6 border border-dashed rounded-lg border-gray-300">
        <p className="text-gray-500">Select a goal to view tasks</p>
      </div>
    );
  }
  
  return (
    <div className="tasks-list mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: selectedGoal.color }}
          ></div>
          <h3 className="text-lg font-medium">Tasks for {selectedGoal.title}</h3>
        </div>
        <button
          onClick={handleAddTask}
          className="p-1.5 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
          title="Add new task"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg border-gray-300">
          <p className="text-gray-500">No tasks added to this goal yet</p>
          <button
            onClick={handleAddTask}
            className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600 transition-colors"
          >
            Add Your First Task
          </button>
        </div>
      ) : (
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Tasks to Complete</h4>
          <Droppable droppableId="incomplete-tasks" type="TASK">
            {(provided) => (
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 mb-6"
              >
                {incompleteTasks.length === 0 ? (
                  <li className="p-2 text-sm text-gray-500 italic">
                    All tasks completed! Add more tasks or celebrate your achievement.
                  </li>
                ) : (
                  incompleteTasks.map((task, index) => (
                    <DraggableTask
                      key={task._id}
                      task={task}
                      index={index}
                      onTaskToggle={handleTaskToggle}
                      onEditTask={handleEditTask}
                      goalColor={selectedGoal.color}
                      isCompleted={false}
                    />
                  ))
                )}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
          
          {completedTasks.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Completed Tasks</h4>
              <Droppable droppableId="completed-tasks" type="TASK">
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {completedTasks.map((task, index) => (
                      <DraggableTask
                        key={task._id}
                        task={task}
                        index={index}
                        onTaskToggle={handleTaskToggle}
                        onEditTask={handleEditTask}
                        goalColor={selectedGoal.color}
                        isCompleted={true}
                      />
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </>
          )}
        </div>
      )}
      
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={editingTask}
          goalId={selectedGoal._id}
        />
      )}
    </div>
  );
};

export default TasksList; 