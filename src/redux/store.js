import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './reducers/eventSlice';

export const store = configureStore({
  reducer: {
    events: eventReducer,
  },
  // Add middleware and other options if needed
});

export default store; 