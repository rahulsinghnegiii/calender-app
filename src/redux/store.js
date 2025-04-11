import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './reducers/eventSlice';
import goalReducer from './reducers/goalSlice';
import taskReducer from './reducers/taskSlice';

export const store = configureStore({
  reducer: {
    events: eventReducer,
    goals: goalReducer,
    tasks: taskReducer,
  },
  // Add middleware and other options if needed
});

export default store; 