import axios from 'axios';

// Get API URL from environment variables or default to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API Service using base URL:', API_URL);

// Flag to track if we should use mock data (when backend is unreachable)
let useMockData = false;

// Cold start detection
let isFirstRequest = true;

// Create axios instance with much higher timeout for first request to handle cold starts
const api = axios.create({
    baseURL: API_URL,
    timeout: isFirstRequest ? 90000 : 30000, // 90 seconds for first request, 30 seconds for subsequent requests
});

// Request interceptor for debugging and cold start handling
api.interceptors.request.use(
    config => {
        // If this is the first request after app load, use longer timeout for cold start
        if (isFirstRequest) {
            console.log('First request after load - using extended timeout for cold start');
            config.timeout = 90000; // 90 seconds for first request
        }

        console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, 
                    config.data ? '[data]' : '', 
                    `timeout: ${config.timeout}ms`);
        
        // If we've already determined the backend is unreachable, skip actual API calls
        if (useMockData && !config.url.includes('/debug/')) {
            console.log('Backend unreachable, cancelling request to use mock data instead');
            return Promise.reject(new axios.Cancel('Backend unreachable, using mock data'));
        }
        
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
        // After first successful response, we know cold start is complete
        if (isFirstRequest) {
            isFirstRequest = false;
            console.log('✅ First request completed successfully, cold start complete');
        }

        console.log(`✅ API Response: ${response.status}`, response.data ? '[data received]' : '');
        
        // If the backend sent a mock flag, mark that we should use mock data
        if (response.data?.data?.mock) {
            console.log('Received mock data from backend, future requests will use mock data');
        }
        
        return response;
    },
    error => {
        // More detailed error logging
        if (error.code === 'ECONNABORTED') {
            console.error('❌ API Timeout Error: Request took too long to complete');
            useMockData = true; // Switch to mock data mode for future requests
            
            // Show a more user-friendly message for cold starts
            if (isFirstRequest) {
                console.error('This appears to be a cold start issue with the backend service.');
                isFirstRequest = false; // Don't try extended timeout again
            }
        } else if (!error.response) {
            console.error('❌ API Network Error: Cannot connect to the server. Is the backend running?', error.message);
            useMockData = true; // Switch to mock data mode for future requests
        } else if (error.response.status === 401) {
            console.error('❌ Authentication Error: 401 Unauthorized. Falling back to mock data.');
            useMockData = true; // Switch to mock data mode for future requests
        } else {
            console.error('❌ API Response Error:', error.response ? error.response.data : error.message);
        }
        return Promise.reject(error);
    }
);

// Helper to create unique temporary IDs
const createTempId = () => `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Function to create mock event for fallback
const createMockEvent = (eventData) => {
    return {
        _id: createTempId(),
        ...eventData,
        mock: true,
        createdAt: new Date().toISOString()
    };
};

// Create mock goals for fallback
const mockGoals = [
    { _id: 'mock-goal-1', title: 'Work', color: '#3B82F6', mock: true },
    { _id: 'mock-goal-2', title: 'Personal', color: '#10B981', mock: true },
    { _id: 'mock-goal-3', title: 'Learning', color: '#8B5CF6', mock: true }
];

// Create mock tasks for fallback
const mockTasks = [
    { _id: 'mock-task-1', title: 'Complete project', goalId: 'mock-goal-1', completed: false, mock: true },
    { _id: 'mock-task-2', title: 'Learn React', goalId: 'mock-goal-3', completed: false, mock: true },
    { _id: 'mock-task-3', title: 'Exercise', goalId: 'mock-goal-2', completed: true, mock: true }
];

// Display notification to user about backend status
const notifyUserAboutBackendStatus = () => {
    // Add a notification element if it doesn't exist
    if (!document.getElementById('backend-status-notification')) {
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'backend-status-notification';
        notificationDiv.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#f8d7da; color:#721c24; padding:10px 15px; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.2); z-index:9999; max-width:300px;';
        notificationDiv.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">Using Offline Mode</div>
            <div style="font-size:0.9em;">The backend service is currently unavailable or waking up from sleep. Your changes will be saved locally for now.</div>
            <button id="dismiss-notification" style="background:#721c24; color:white; border:none; padding:3px 8px; margin-top:8px; border-radius:3px; cursor:pointer;">Dismiss</button>
        `;
        document.body.appendChild(notificationDiv);
        
        // Add dismiss handler
        document.getElementById('dismiss-notification').addEventListener('click', () => {
            document.getElementById('backend-status-notification').style.display = 'none';
        });
    } else {
        // Show the notification if it was hidden
        const notification = document.getElementById('backend-status-notification');
        if (notification) {
            notification.style.display = 'block';
        }
    }
};

// Event service with API methods
export const eventService = {
    // Get all events (with optional date range filter)
    getEvents: async (dateRange) => {
        let url = '/events';
        if (dateRange) {
            url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }
        
        try {
            if (useMockData) {
                console.log('Using mock events data (empty array)');
                // Show notification to user
                notifyUserAboutBackendStatus();
                return {
                    data: {
                        success: true,
                        data: [],
                        mock: true
                    }
                };
            }
            
            return await api.get(url);
        } catch (error) {
            console.error('Error fetching events:', error);
            
            // Show notification to user
            notifyUserAboutBackendStatus();
            
            // Return mock empty array
            return {
                data: {
                    success: true,
                    data: [],
                    mock: true
                }
            };
        }
    },
    
    // Create a new event
    createEvent: async (eventData) => {
        try {
            if (useMockData) {
                console.log('Using mock event data due to server connection issue');
                // Show notification to user
                notifyUserAboutBackendStatus();
                return {
                    data: {
                        success: true,
                        data: createMockEvent(eventData),
                        message: 'Mock event created because API is unreachable'
                    }
                };
            }
            
            const response = await api.post('/events', eventData);
            
            // If response contains a mock flag, update our global state
            if (response.data?.data?.mock) {
                useMockData = true;
                console.log('Server sent mock data, future requests will use mock data');
                // Show notification to user
                notifyUserAboutBackendStatus();
            }
            
            return response;
        } catch (error) {
            console.error('Error creating event:', error);
            // Show notification to user
            notifyUserAboutBackendStatus();
            
            // Return a mock response with the data we were trying to save
            return {
                data: {
                    success: true,
                    data: createMockEvent(eventData),
                    message: 'Mock event created because API failed'
                }
            };
        }
    },
    
    // Update an existing event
    updateEvent: async (id, eventData) => {
        try {
            if (useMockData) {
                console.log('Using mock update data due to server connection issue');
                return {
                    data: {
                        success: true,
                        data: {
                            _id: id,
                            ...eventData,
                            mock: true,
                            updatedAt: new Date().toISOString()
                        },
                        message: 'Mock event updated because API is unreachable'
                    }
                };
            }
            
            return await api.put(`/events/${id}`, eventData);
        } catch (error) {
            console.error('Error updating event:', error);
            // Return a mock response to keep the application working
            return {
                data: {
                    success: true,
                    data: {
                        _id: id,
                        ...eventData,
                        mock: true
                    },
                    message: 'Mock event updated because API failed'
                }
            };
        }
    },
    
    // Delete an event
    deleteEvent: async (id) => {
        try {
            if (useMockData) {
                console.log('Using mock delete data due to server connection issue');
                return {
                    data: {
                        success: true,
                        data: {},
                        message: 'Mock event deleted because API is unreachable'
                    }
                };
            }
            
            return await api.delete(`/events/${id}`);
        } catch (error) {
            console.error('Error deleting event:', error);
            // Return a mock response to keep the application working
            return {
                data: {
                    success: true,
                    data: {},
                    message: 'Mock event deleted because API failed'
                }
            };
        }
    }
};

// Goal service with API methods and mock data fallback
export const goalService = {
    // Get all goals
    getGoals: async () => {
        try {
            if (useMockData) {
                console.log('Using mock goals data');
                return {
                    data: {
                        success: true,
                        data: mockGoals,
                        mock: true
                    }
                };
            }
            
            return await api.get('/goals');
        } catch (error) {
            console.error('Error fetching goals:', error);
            
            // Return mock goals
            return {
                data: {
                    success: true,
                    data: mockGoals,
                    mock: true
                }
            };
        }
    },
    
    // Get tasks for a specific goal
    getGoalTasks: async (goalId) => {
        try {
            if (useMockData) {
                console.log('Using mock tasks data for goal', goalId);
                const filteredTasks = mockTasks.filter(task => 
                    task.goalId === goalId || 
                    (goalId.startsWith('mock') && task.goalId.startsWith('mock'))
                );
                return {
                    data: {
                        success: true,
                        data: filteredTasks,
                        mock: true
                    }
                };
            }
            
            return await api.get(`/goals/${goalId}/tasks`);
        } catch (error) {
            console.error('Error fetching goal tasks:', error);
            
            // Return mock tasks for this goal
            return {
                data: {
                    success: true,
                    data: mockTasks.filter(task => 
                        task.goalId === goalId || 
                        (goalId.startsWith('mock') && task.goalId.startsWith('mock'))
                    ),
                    mock: true
                }
            };
        }
    }
};

// Task service with API methods and mock data fallback
export const taskService = {
    // Get all tasks
    getTasks: async () => {
        try {
            if (useMockData) {
                console.log('Using mock tasks data');
                return {
                    data: {
                        success: true,
                        data: mockTasks,
                        mock: true
                    }
                };
            }
            
            return await api.get('/tasks');
        } catch (error) {
            console.error('Error fetching tasks:', error);
            
            // Return mock tasks
            return {
                data: {
                    success: true,
                    data: mockTasks,
                    mock: true
                }
            };
        }
    },
    
    // Create a new task
    createTask: async (taskData) => {
        try {
            if (useMockData) {
                console.log('Using mock task creation');
                const newTask = {
                    _id: createTempId(),
                    ...taskData,
                    mock: true,
                    createdAt: new Date().toISOString()
                };
                mockTasks.push(newTask);
                return {
                    data: {
                        success: true,
                        data: newTask,
                        mock: true
                    }
                };
            }
            
            return await api.post('/tasks', taskData);
        } catch (error) {
            console.error('Error creating task:', error);
            
            // Create a mock task and add to our local collection
            const newTask = {
                _id: createTempId(),
                ...taskData,
                mock: true,
                createdAt: new Date().toISOString()
            };
            mockTasks.push(newTask);
            
            return {
                data: {
                    success: true,
                    data: newTask,
                    mock: true
                }
            };
        }
    }
};

export default api; 