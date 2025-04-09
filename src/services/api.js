import axios from 'axios';

// Get API URL from environment variables or default to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API Service using base URL:', API_URL);

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout (increased from 10 seconds)
});

// Request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
        return config;
    },
    error => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log(`✅ API Response: ${response.status}`, response.data);
        return response;
    },
    error => {
        // More detailed error logging
        if (error.code === 'ECONNABORTED') {
            console.error('❌ API Timeout Error: Request took too long to complete');
        } else if (!error.response) {
            console.error('❌ API Network Error: Cannot connect to the server. Is the backend running?', error.message);
        } else {
            console.error('❌ API Response Error:', error.response ? error.response.data : error.message);
        }
        return Promise.reject(error);
    }
);

// Event service with API methods
export const eventService = {
    // Get all events (with optional date range filter)
    getEvents: async (dateRange) => {
        let url = '/events';
        if (dateRange) {
            url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }
        console.log('Fetching events from complete URL:', `${API_URL}${url}`);
        try {
            return await api.get(url);
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },
    
    // Create a new event
    createEvent: async (eventData) => {
        try {
            return await api.post('/events', eventData);
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },
    
    // Update an existing event
    updateEvent: async (id, eventData) => {
        try {
            return await api.put(`/events/${id}`, eventData);
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },
    
    // Delete an event
    deleteEvent: async (id) => {
        try {
            return await api.delete(`/events/${id}`);
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
};

export default api; 