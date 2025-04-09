import axios from 'axios';

// Get API URL from environment variables or default to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API Service using base URL:', API_URL);

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
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
        console.error('❌ API Response Error:', error.response ? error.response.data : error.message);
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
        return api.get(url);
    },
    
    // Create a new event
    createEvent: async (eventData) => {
        return api.post('/events', eventData);
    },
    
    // Update an existing event
    updateEvent: async (id, eventData) => {
        return api.put(`/events/${id}`, eventData);
    },
    
    // Delete an event
    deleteEvent: async (id) => {
        return api.delete(`/events/${id}`);
    }
};

export default api; 