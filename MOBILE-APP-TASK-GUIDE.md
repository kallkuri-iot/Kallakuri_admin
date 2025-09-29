# Mobile App Internal Task Assignment Guide

This guide explains how to implement the simplified internal task assignment functionality in the mobile app, supporting both assignment to existing system users and to new external users.

## API Endpoints

### 1. Get All Users for Task Assignment
- **Endpoint**: `GET /api/auth/all-users`
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Purpose**: Fetch all available users in the system to populate a dropdown/picker in your app
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

### 2. Create Internal Task (Simplified)
- **Endpoint**: `POST /tasks/internal-task`
- **Headers**: `Authorization: Bearer JWT_TOKEN`
- **Purpose**: Create a simple task with just task details and assignee information

## Implementation Steps

### Step 1: Create Task Assignment UI

In your mobile app, build a simple task creation screen with:

1. Text field for task details
2. Dropdown/picker for selecting user from the list
3. "Other" option at the bottom of the dropdown for users not in the system
4. Text field for entering the name of other user (only shown when "Other" is selected)

### Step 2: Submit Task

When the user submits the form:

#### Case 1: Assigning to Existing User:
```javascript
// Example request payload
const taskData = {
  taskDetail: "Please visit tomorrow Moti Nagar for review.",
  assignTo: "userId1", // ID from the dropdown
  isOtherUser: false
}

// Make API call
fetch('/tasks/internal-task', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(taskData)
})
```

#### Case 2: Assigning to "Other" User:
```javascript
// Example request payload
const taskData = {
  taskDetail: "Please visit tomorrow Moti Nagar for review.",
  isOtherUser: true,
  otherUserName: "Naman"
}

// Make API call
fetch('/tasks/internal-task', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(taskData)
})
```

## Complete Task Creation Flow

1. User opens "Create Task" screen in the app
2. App loads user list from `/api/auth/all-users`
3. User enters task detail in the text field
4. User selects assignee from the dropdown:
   
   ### Option A: Assign to Existing User
   - User selects a name from the dropdown
   - App sends request with:
     ```json
     {
       "taskDetail": "Task detail text",
       "assignTo": "userId",
       "isOtherUser": false
     }
     ```
   
   ### Option B: Assign to "Other" User
   - User selects "Other" option from dropdown
   - App shows text field for entering the person's name
   - User enters name (e.g., "Naman")
   - App sends request with:
     ```json
     {
       "taskDetail": "Task detail text",
       "isOtherUser": true,
       "otherUserName": "Naman"
     }
     ```

5. App receives response and shows success message

## Response Example

```json
{
  "success": true,
  "data": {
    "_id": "taskId123",
    "title": "Please visit tomorrow Moti Nagar for review.",
    "status": "Pending",
    "assignedTo": {
      "_id": "userId1",
      "name": "John Doe"
    },
    "createdAt": "2025-05-20T10:00:00Z",
    "updatedAt": "2025-05-20T10:00:00Z"
  }
}
```

Or for "Other" user:

```json
{
  "success": true,
  "data": {
    "_id": "taskId456",
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

## Required Fields

| Field | Description | Requirement |
|-------|-------------|------------|
| `taskDetail` | Task details text | Always required |
| `assignTo` | User ID | Required if `isOtherUser` is false |
| `isOtherUser` | Flag to indicate external user | Required |
| `otherUserName` | Name of external person | Required if `isOtherUser` is true |

## Error Handling

The API will return validation errors if required fields are missing:
- If `isOtherUser` is true but `otherUserName` is missing
- If `isOtherUser` is false but `assignTo` is missing or invalid

Be sure to handle these validation errors in your app UI by showing appropriate error messages.

## Need Help?

For any questions or issues regarding this implementation, please contact the backend team. 