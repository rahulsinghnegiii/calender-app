import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventService } from '../../services/api';

// For logging to help debug
console.log('Event Slice initialized');

// Async thunks for API calls
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await eventService.getEvents(dateRange);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return rejectWithValue(error.response?.data || { error: 'Network error' });
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventService.createEvent(eventData);
      
      // Check if this is a mock response (server connection failed)
      if (response.data.data.mock) {
        console.log('Using mock event data due to server connection issue');
      }
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to create event' });
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventService.updateEvent(id, eventData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to update event' });
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await eventService.deleteEvent(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete event' });
    }
  }
);

const initialState = {
  events: [],
  isLoading: false,
  error: null,
  currentEvent: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch events';
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Check if the event is a mock (temporary) one
        if (action.payload.mock) {
          // Add a flag to indicate this is a temporary event
          action.payload.temporary = true;
        }
        
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create event';
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update event';
      })
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = state.events.filter(event => event._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete event';
      });
  },
});

export const { setCurrentEvent, clearCurrentEvent } = eventSlice.actions;

// Selectors
export const selectAllEvents = (state) => state.events.events;
export const selectEventById = (state, eventId) => 
  state.events.events.find(event => event._id === eventId);
export const selectEventsByCategory = (state, category) => 
  state.events.events.filter(event => event.category === category);
export const selectIsLoading = (state) => state.events.isLoading;
export const selectError = (state) => state.events.error;
export const selectCurrentEvent = (state) => state.events.currentEvent;

export default eventSlice.reducer; 