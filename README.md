# Calendar Application

A Google Calendar-like web application built with React, Redux, and MongoDB. The application allows users to view, create, edit, and manage events in a weekly calendar view.

## Features

- Weekly calendar view
- Create events with title, category, date, start time, and end time
- Edit existing events
- Delete events
- Drag and drop events to different times/days
- Category-based event coloring
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React.js with Vite
- Redux with Redux Toolkit for state management
- React Big Calendar for calendar view
- React Hook Form for form handling
- Tailwind CSS for styling
- Axios for API requests
- Moment.js for date manipulation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- RESTful API architecture

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/calendar-app
   NODE_ENV=development
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the main directory:
   ```
   cd ..
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## API Endpoints

- `GET /api/events` - Get all events (with optional date range filtering)
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an existing event
- `DELETE /api/events/:id` - Delete an event

## Event Categories

The application supports the following event categories:
- Exercise
- Eating
- Work
- Relax
- Family
- Social

Each category has its own color for easy visual identification in the calendar.

## Usage

### Viewing Events
- Events are displayed in the weekly calendar view
- Each event shows its title and is color-coded based on its category

### Creating Events
1. Click on any time slot in the calendar
2. Fill in the event details in the modal:
   - Title
   - Category (from dropdown)
   - Date
   - Start time
   - End time
3. Click "Create" to save the event

### Editing Events
1. Click on an existing event in the calendar
2. Modify the event details in the modal
3. Click "Update" to save changes or "Delete" to remove the event

### Moving Events
- Simply drag and drop events to a different time slot or day

## Project Structure

```
calendar-app/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── Calendar/         # Calendar-related components
│   │   ├── EventModal/       # Event creation/editing modal
│   │   └── common/           # Common UI components
│   ├── redux/                # Redux state management
│   │   ├── actions/          # Redux actions
│   │   ├── reducers/         # Redux reducers/slices
│   │   └── store.js          # Redux store configuration
│   ├── services/             # API services
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main application component
│   └── main.jsx              # Application entry point
├── backend/                  # Backend source code
│   ├── config/               # Configuration files
│   ├── controllers/          # API controllers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   └── server.js             # Express server
└── README.md                 # Project documentation
```
