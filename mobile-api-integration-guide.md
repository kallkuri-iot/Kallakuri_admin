# Mobile API Integration Guide

## Overview

This document provides information for mobile developers on how to integrate with our backend APIs. The API supports both Product Management and Staff Activity tracking features.

## Base URL

```
http://localhost:5050/api/mobile
```

For production, replace with the actual production URL.

## Authentication

All API requests require authentication using JWT tokens.

### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "YourPassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "your-jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "Marketing Staff"
  }
}
```

### Using the Token

Include the token in the Authorization header for all authenticated requests:

```
Authorization: Bearer your-jwt-token
```

## 1. Product Management APIs

The product management APIs allow mobile clients to interact with product data, including brands, variants, and sizes.

### Get All Products

```
GET /api/products
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "product-id-1",
      "brandName": "Brand 1",
      "variants": [
        {
          "_id": "variant-id-1",
          "name": "Variant 1",
          "sizes": [
            {
              "_id": "size-id-1",
              "name": "Size 1",
              "isActive": true
            }
          ],
          "isActive": true
        }
      ],
      "isActive": true,
      "createdBy": {
        "_id": "user-id",
        "name": "User Name"
      },
      "createdAt": "2023-07-21T10:30:00.000Z",
      "updatedAt": "2023-07-21T10:30:00.000Z"
    }
  ]
}
```

### Get Product by ID

```
GET /api/products/:id
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "product-id-1",
    "brandName": "Brand 1",
    "variants": [
      {
        "_id": "variant-id-1",
        "name": "Variant 1",
        "sizes": [
          {
            "_id": "size-id-1",
            "name": "Size 1",
            "isActive": true
          }
        ],
        "isActive": true
      }
    ],
    "isActive": true,
    "createdBy": {
      "_id": "user-id",
      "name": "User Name"
    },
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
}
```

## 2. Staff Activity APIs

The staff activity APIs support various types of staff activities, including marketing staff punch-in/out functionality.

### Marketing Staff Activity

#### Punch In

```
POST /api/mobile/marketing-activity/punch-in
```

**Request Body:**
```json
{
  "retailShop": "Shyam ji foods",
  "distributor": "Shyam Chaudhary",
  "areaName": "223/23, Ramesh Nagar, Delhi",
  "tripCompanion": {
    "category": "Distributor Staff",
    "name": "Nitin"
  },
  "modeOfTransport": "Vehicle",
  "selfieImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...", 
  "shopTypes": ["Retailer", "Whole Seller"],
  "shops": [
    {
      "name": "Nandu Shop",
      "type": "Retailer"
    },
    {
      "name": "Chandu Shop",
      "type": "Retailer"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "activity-id",
    "marketingStaffId": "user-id",
    "retailShop": "Shyam ji foods",
    "distributor": "Shyam Chaudhary",
    "areaName": "223/23, Ramesh Nagar, Delhi",
    "tripCompanion": {
      "category": "Distributor Staff",
      "name": "Nitin"
    },
    "modeOfTransport": "Vehicle",
    "meetingStartTime": "2023-07-21T10:30:00.000Z",
    "selfieImage": "/uploads/selfies/selfie_60f7b0b3c9d4a84e8c9d4a84_1689939000000.jpg",
    "shopTypes": ["Retailer", "Whole Seller"],
    "shops": [
      {
        "name": "Nandu Shop",
        "type": "Retailer"
      },
      {
        "name": "Chandu Shop",
        "type": "Retailer"
      }
    ],
    "status": "Punched In",
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
}
```

#### Punch Out

```
PATCH /api/mobile/marketing-activity/:id/punch-out
```

**Request Body:**
```json
{
  "shops": [
    {
      "name": "Anand Shop",
      "type": "Retailer"
    },
    {
      "name": "Piyush Shop",
      "type": "Retailer"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "activity-id",
    "marketingStaffId": "user-id",
    "retailShop": "Shyam ji foods",
    "distributor": "Shyam Chaudhary",
    "areaName": "223/23, Ramesh Nagar, Delhi",
    "tripCompanion": {
      "category": "Distributor Staff",
      "name": "Nitin"
    },
    "modeOfTransport": "Vehicle",
    "meetingStartTime": "2023-07-21T10:30:00.000Z",
    "meetingEndTime": "2023-07-21T12:45:00.000Z",
    "selfieImage": "/uploads/selfies/selfie_60f7b0b3c9d4a84e8c9d4a84_1689939000000.jpg",
    "shopTypes": ["Retailer", "Whole Seller"],
    "shops": [
      {
        "name": "Nandu Shop",
        "type": "Retailer"
      },
      {
        "name": "Chandu Shop",
        "type": "Retailer"
      },
      {
        "name": "Anand Shop",
        "type": "Retailer"
      },
      {
        "name": "Piyush Shop",
        "type": "Retailer"
      }
    ],
    "status": "Punched Out",
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T12:45:00.000Z"
  }
}
```

#### Get My Activities

```
GET /api/mobile/marketing-activity/my-activities
```

Query Parameters:
- `date`: (optional) Filter by date in YYYY-MM-DD format

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "activity-id-1",
      "marketingStaffId": "user-id",
      "retailShop": "Shyam ji foods",
      "distributor": "Shyam Chaudhary",
      "areaName": "223/23, Ramesh Nagar, Delhi",
      "tripCompanion": {
        "category": "Distributor Staff",
        "name": "Nitin"
      },
      "modeOfTransport": "Vehicle",
      "meetingStartTime": "2023-07-21T10:30:00.000Z",
      "meetingEndTime": "2023-07-21T12:45:00.000Z",
      "selfieImage": "/uploads/selfies/selfie_60f7b0b3c9d4a84e8c9d4a84_1689939000000.jpg",
      "shopTypes": ["Retailer", "Whole Seller"],
      "shops": [...],
      "status": "Punched Out",
      "createdAt": "2023-07-21T10:30:00.000Z",
      "updatedAt": "2023-07-21T12:45:00.000Z"
    },
    {
      "_id": "activity-id-2",
      "status": "Punched In",
      // Other activity details...
    }
  ]
}
```

### Generic Staff Activity

For other staff types, use the generic staff activity endpoints:

#### Punch In

```
POST /api/mobile/staff-activity/punch-in
```

**Request Body:**
```json
{
  "staffType": "Factory Staff",
  "location": "Main Factory Floor, Building B",
  "department": "Production",
  "taskType": "Machine Operation",
  "notes": "Started work on production line 3",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "activity-id",
    "staffId": "user-id",
    "staffType": "Factory Staff",
    "location": "Main Factory Floor, Building B",
    "department": "Production",
    "taskType": "Machine Operation",
    "notes": "Started work on production line 3",
    "image": "/uploads/activities/activity_60f7b0b3c9d4a84e8c9d4a84_1689939000000.jpg",
    "startTime": "2023-07-21T10:30:00.000Z",
    "status": "Punched In",
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T10:30:00.000Z"
  }
}
```

#### Punch Out

```
PATCH /api/mobile/staff-activity/:id/punch-out
```

**Request Body:**
```json
{
  "notes": "Completed maintenance tasks on machine 3, waiting for quality check."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "activity-id",
    "staffId": "user-id",
    "staffType": "Factory Staff",
    "location": "Main Factory Floor, Building B",
    "department": "Production",
    "taskType": "Machine Operation",
    "notes": "Completed maintenance tasks on machine 3, waiting for quality check.",
    "image": "/uploads/activities/activity_60f7b0b3c9d4a84e8c9d4a84_1689939000000.jpg",
    "startTime": "2023-07-21T10:30:00.000Z",
    "endTime": "2023-07-21T12:45:00.000Z",
    "status": "Punched Out",
    "createdAt": "2023-07-21T10:30:00.000Z",
    "updatedAt": "2023-07-21T12:45:00.000Z"
  }
}
```

#### Get My Activities

```
GET /api/mobile/staff-activity/my-activities
```

Query Parameters:
- `date`: (optional) Filter by date in YYYY-MM-DD format
- `staffType`: (optional) Filter by staff type

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "activity-id-1",
      "staffId": "user-id",
      "staffType": "Factory Staff",
      "location": "Main Factory Floor, Building B",
      "department": "Production",
      "taskType": "Machine Operation",
      "notes": "Completed maintenance tasks on machine 3, waiting for quality check.",
      "image": "/uploads/activities/activity_60f7b0b3c9d4a84e8c9d4a84_1689939000000.jpg",
      "startTime": "2023-07-21T10:30:00.000Z",
      "endTime": "2023-07-21T12:45:00.000Z",
      "status": "Punched Out",
      "createdAt": "2023-07-21T10:30:00.000Z",
      "updatedAt": "2023-07-21T12:45:00.000Z"
    },
    {
      "_id": "activity-id-2",
      "status": "Punched In",
      // Other activity details...
    }
  ]
}
```

## Error Handling

All API endpoints follow a consistent error format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid or missing authentication)
- 403: Forbidden (authenticated but not authorized)
- 404: Not Found
- 429: Too Many Requests (rate limiting)
- 500: Internal Server Error

## Mobile App Implementation Guidelines

1. **Authentication Flow**:
   - Store the JWT token securely after login
   - Include it in all subsequent API requests
   - Implement token refresh when needed

2. **Product Management**:
   - Cache product data locally to reduce API calls
   - Implement pull-to-refresh for updated product information
   - Support offline viewing of previously loaded products

3. **Staff Activity**:
   - Allow staff to easily punch in and out
   - Implement location tracking if required
   - Handle image uploads efficiently (compression before sending)
   - Save activity data locally before sending to server to prevent data loss
   - Implement background sync for failed API calls due to connectivity issues

4. **Error Handling**:
   - Implement robust error handling for API failures
   - Show appropriate user-friendly messages
   - Add retries for network failures

5. **Performance Optimization**:
   - Minimize payload size by requesting only needed data
   - Use pagination for large data sets
   - Implement lazy loading for images

## Testing

We recommend testing your integration with our staging environment before moving to production. Contact the backend team for staging environment credentials and URLs.

## Support

For any questions or issues regarding the API integration, please contact:
- Backend Team: backend@example.com
- API Support: api-support@example.com 