# Calendar App Development Update Plan

## Overview

This document outlines the development plan for implementing the enhancements specified in the project updates. The enhancements include improvements to event display and handling, as well as adding new functionality for goals and tasks with drag-and-drop capabilities.

## 1. Calendar Event Enhancements

### 1.1 Short Duration Events (15-minute slots)
- **Current Issue**: Events with short durations (e.g., 8:15-8:30) may not be displayed properly.
- **Implementation Plan**:
  - Modify the time slot rendering in `CustomWeeklyCalendar.jsx` to support 15-minute intervals instead of hourly intervals
  - Update the event positioning calculations to accurately place events within these smaller time slots
  - Add CSS for properly sizing and displaying short-duration events
  - Test with varying event durations (15min, 30min, 45min, etc.)

### 1.2 Event Expansion and Contraction
- **Current Issue**: Events cannot be expanded or contracted by users.
- **Implementation Plan**:
  - Add resize handlers to event components in all calendar views (day, week, month)
  - Implement resize functionality using drag handles at the bottom of events
  - Create a resizable event component that updates event duration on resize
  - Update the Redux store and backend when an event is resized
  - Add visual indicators during the resize operation
  - Ensure proper validation of new time boundaries

### 1.3 Event Deletion
- **Status**: Already implemented in `EventModal.jsx`
- **Enhancements**:
  - Add a quick delete button directly on events for one-click deletion
  - Implement a confirmation dialog for delete operations
  - Ensure proper cleanup in the Redux store and database

## 2. Goals and Tasks Implementation

### 2.1 Database Schema Updates
- Create new models for goals and tasks in the backend:
  ```javascript
  // Goal Schema
  const goalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    color: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });

  // Task Schema
  const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
    completed: { type: Boolean, default: false }
  });
  ```

### 2.2 Backend API Endpoints
- Create new controllers and routes for goals and tasks:
  - GET `/api/goals` - Fetch all goals
  - POST `/api/goals` - Create a new goal
  - GET `/api/goals/:goalId/tasks` - Fetch tasks for a specific goal
  - POST `/api/tasks` - Create a new task
  - PUT `/api/tasks/:taskId` - Update a task
  - DELETE `/api/tasks/:taskId` - Delete a task

### 2.3 Redux Store Updates
- Create new slices for goals and tasks:
  - `goalSlice.js` with actions for fetching and managing goals
  - `taskSlice.js` with actions for fetching and managing tasks
- Update the store configuration to include these new slices

### 2.4 UI Components

#### 2.4.1 Left Sidebar Component
- Create a new component `GoalsPanel.jsx` for the left sidebar
- Implement the following features:
  - Display a list of goals with appropriate colors
  - Handle goal selection to display associated tasks
  - Style tasks with the same color as their parent goal
  - Make tasks draggable using React DnD or @hello-pangea/dnd

#### 2.4.2 Drag and Drop Integration
- Update the calendar components to accept dropped tasks
- Implement drop zones in all calendar views (day, week, month)
- When a task is dropped on the calendar:
  - Open the event creation modal
  - Pre-populate the event form with task information
  - Set the event color based on the goal color

### 2.5 Sample Data
- Create initial seed data for goals and tasks:
  - Goal: "Learn" with tasks like "AI based agents", "MLE", "DE related", "Basics"
  - Other sample goals with related tasks

## 3. Implementation Timeline

### Week 1: Event Display Enhancements
- Day 1-2: Implement 15-minute time slots
- Day 3-4: Add event expansion/contraction functionality
- Day 5: Testing and bug fixes for event display features

### Week 2: Goals and Tasks Backend
- Day 1-2: Create database models and controllers
- Day 3: Implement API endpoints
- Day 4-5: Testing API endpoints and fixing issues

### Week 3: Frontend Integration
- Day 1-2: Implement Redux slices for goals and tasks
- Day 3-4: Create the left sidebar with goals and tasks
- Day 5: Implement drag and drop from tasks to calendar

### Week 4: Finalization
- Day 1-2: Integration testing
- Day 3: Bug fixes and UI polishing
- Day 4-5: Documentation and final testing

## 4. Testing Strategy

### Unit Tests
- Test individual components like the resizable event component
- Test Redux actions and reducers for goals and tasks
- Test utility functions for time calculations

### Integration Tests
- Test the interaction between the tasks panel and calendar
- Test drag and drop functionality
- Test event creation from dropped tasks

### End-to-End Tests
- Test complete workflows from goal selection to task display to event creation
- Test application performance with a large number of goals, tasks, and events

## 5. Deployment Considerations

- Update the database schema in production
- Consider database migration strategy for existing data
- Plan for backward compatibility during phased rollout
- Update environment variables if needed for new features

## 6. Documentation Updates

- Update user documentation with new features
- Create developer documentation for the goals and tasks system
- Add code comments for complex interactions like drag and drop