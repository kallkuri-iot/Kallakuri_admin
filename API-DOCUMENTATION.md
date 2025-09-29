# Kallakuri Admin Panel API Documentation

This document provides comprehensive documentation for the API endpoints of the Kallakuri Admin Panel. It is intended for app developers who need to integrate with our backend services.

## Authentication

### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate a user and receive a JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
      "_id": "userId",
      "name": "User Name",
      "email": "user@example.com",
      "role": "Admin"
    }
  }
  ```

### Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Description**: Get the profile of the currently authenticated user
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "userId",
      "name": "User Name",
      "email": "user@example.com",
      "role": "Admin"
    }
  }
  ```

## User Management

### Get All Users
- **Endpoint**: `GET /api/auth/all-users`
- **Description**: Get a list of all users in the system for task assignment
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "userId1",
        "name": "User 1",
        "role": "Marketing Staff"
      },
      {
        "_id": "userId2",
        "name": "User 2",
        "role": "Godown Incharge"
      }
    ]
  }
  ```

## Task Management

### Create Task
- **Endpoint**: `POST /tasks`
- **Description**: Create a new task for either a system user or an external user
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Request Body for Internal User**:
  ```json
  {
    "title": "Visit Distributor X",
    "description": "Check inventory levels and discuss new product launch",
    "assignedTo": "userId1",
    "staffRole": "Marketing Staff",
    "distributorId": "distributorId",
    "deadline": "2025-06-01T12:00:00Z"
  }
  ```
- **Request Body for External User**:
  ```json
  {
    "title": "Conduct Market Survey",
    "description": "Survey the local market for competitor pricing",
    "isExternalUser": true,
    "assigneeName": "John Doe (External)",
    "staffRole": "Marketing Staff",
    "distributorId": "distributorId",
    "deadline": "2025-06-01T12:00:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "taskId",
      "title": "Task Title",
      "description": "Task Description",
      "status": "Pending",
      "assignedTo": "userId", // null for external users
      "isExternalUser": false, // true for external users
      "assigneeName": "John Doe", // only for external users
      "staffRole": "Marketing Staff",
      "deadline": "2025-06-01T12:00:00Z",
      "createdAt": "2025-05-20T10:00:00Z",
      "updatedAt": "2025-05-20T10:00:00Z"
    }
  }
  ```

### Create Internal Task (Mobile App)
- **Endpoint**: `POST /tasks/internal-task`
- **Description**: Create a simplified task with just task details and assignee information
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Request Body for Existing User**:
  ```json
  {
    "taskDetail": "Please visit tomorrow Moti Nagar for review.",
    "assignTo": "userId1",
    "isOtherUser": false
  }
  ```
- **Request Body for Other User**:
  ```json
  {
    "taskDetail": "Please visit tomorrow Moti Nagar for review.",
    "isOtherUser": true,
    "otherUserName": "Naman"
  }
  ```
- **Response for Existing User**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "taskId",
      "title": "Please visit tomorrow Moti Nagar for review.",
      "status": "Pending",
      "assignedTo": {
        "_id": "userId1",
        "name": "User Name"
      },
      "createdAt": "2025-05-20T10:00:00Z",
      "updatedAt": "2025-05-20T10:00:00Z"
    }
  }
  ```
- **Response for Other User**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "taskId",
      "title": "Please visit tomorrow Moti Nagar for review.",
      "status": "Pending",
      "externalAssignee": {
        "name": "Naman",
        "isExternalUser": true
      },
      "createdAt": "2025-05-20T10:00:00Z",
      "updatedAt": "2025-05-20T10:00:00Z"
    }
  }
  ```

### Get All Tasks
- **Endpoint**: `GET /tasks`
- **Description**: Get all tasks with optional filtering
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Query Parameters**:
  - `status`: Filter by status (Pending, In Progress, Completed)
  - `assignedTo`: Filter by user ID
  - `staffRole`: Filter by staff role
  - `type`: Filter by task type (internal, external)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "taskId1",
        "title": "Internal Task",
        "description": "Task description",
        "status": "Pending",
        "assignedTo": {
          "_id": "userId",
          "name": "User Name"
        },
        "isExternalUser": false,
        "staffRole": "Marketing Staff",
        "deadline": "2025-06-01T12:00:00Z",
        "createdAt": "2025-05-20T10:00:00Z",
        "updatedAt": "2025-05-20T10:00:00Z"
      },
      {
        "_id": "taskId2",
        "title": "External Task",
        "description": "Task description",
        "status": "Pending",
        "assignedTo": null,
        "isExternalUser": true,
        "assigneeName": "External User Name",
        "staffRole": "Marketing Staff",
        "deadline": "2025-06-01T12:00:00Z",
        "createdAt": "2025-05-20T10:00:00Z",
        "updatedAt": "2025-05-20T10:00:00Z"
      }
    ]
  }
  ```

### Get Task by ID
- **Endpoint**: `GET /tasks/{taskId}`
- **Description**: Get details of a specific task
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "taskId",
      "title": "Task Title",
      "description": "Task Description",
      "status": "Pending",
      "assignedTo": {
        "_id": "userId",
        "name": "User Name"
      }, // null for external users
      "isExternalUser": false, // true for external users
      "assigneeName": "External User Name", // only present for external users
      "staffRole": "Marketing Staff",
      "distributorId": "distributorId", // for Marketing Staff tasks
      "deadline": "2025-06-01T12:00:00Z",
      "createdAt": "2025-05-20T10:00:00Z",
      "updatedAt": "2025-05-20T10:00:00Z"
    }
  }
  ```

### Update Task Status
- **Endpoint**: `PATCH /tasks/{taskId}`
- **Description**: Update the status of a task
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Request Body**:
  ```json
  {
    "status": "In Progress",
    "report": "https://example.com/report.pdf" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "taskId",
      "title": "Task Title",
      "status": "In Progress",
      "report": "https://example.com/report.pdf",
      "updatedAt": "2025-05-20T11:00:00Z"
    }
  }
  ```

## How to Use the Task Assignment Features in Mobile App

The system now supports creating tasks from the mobile app for both existing users (who have accounts in the system) and new external users (who don't have accounts in the system).

### For App Developers: Implementing the Task Assignment Flow

1. First, fetch the list of users from `/api/auth/all-users` to let the user select from existing users
2. When creating a task in the mobile app:
   
   ### Case 1: Assigning to an existing user:
   - User selects a person from the dropdown (populated from `/api/auth/all-users` API)
   - Make a POST request to `/tasks/mobile` with:
     ```json
     {
       "title": "Task title",
       "description": "Task description",
       "assignedTo": "userId",  // ID of the selected user from the dropdown
       "isNewUser": false,
       "staffRole": "Marketing Staff",
       // other task details...
     }
     ```

   ### Case 2: Assigning to a new person not in the system:
   - User selects "Add new person" option in the app
   - App shows fields to enter the new person's details
   - Make a POST request to `/tasks/mobile` with:
     ```json
     {
       "title": "Task title",
       "description": "Task description",
       "isNewUser": true,
       "assigneeName": "New Person Name",  // Name of the external person
       "staffRole": "Marketing Staff",
       // other task details...
     }
     ```

### Key Points for Implementation:

1. The `isNewUser` flag determines whether you're assigning to an existing user or a new external person:
   - If `isNewUser` is `false`: `assignedTo` is required
   - If `isNewUser` is `true`: `assigneeName` is required
   
2. For existing users:
   - Show a dropdown populated from `/api/auth/all-users` API
   - Send the selected user's ID in the `assignedTo` field
   - Set `isNewUser` to `false`
   
3. For new external users:
   - Provide a text field for entering the person's name
   - Send the name in the `assigneeName` field
   - Set `isNewUser` to `true`
   - Do not include `assignedTo` field

4. The response will include different structures based on the type of assignment:
   - For existing users: Look for the `assignedTo` object
   - For new external users: Look for the `externalAssignee` object

## Implementation Notes

- All API requests (except login and register) require a valid JWT token in the Authorization header
- Date fields should be in ISO format (e.g., "2025-05-20T10:00:00Z")
- The `staffRole` field must be one of: "Marketing Staff", "Godown Incharge", or "Mid-Level Manager"
- Task status must be one of: "Pending", "In Progress", or "Completed" 