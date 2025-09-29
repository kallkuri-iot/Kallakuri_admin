# API Summary

## Base URL

For all API requests, use the following base URL:

```
http://localhost:5050/api
```

## Authentication

### Admin Panel Authentication

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/auth/login` | POST | Login with email and password | Public |
| `/auth/register` | POST | Register a new user (admin only in frontend) | Public |
| `/auth/me` | GET | Get current user profile | Private |
| `/auth/update-password` | PATCH | Update current user's password | Private |
| `/auth/logout` | GET | Logout user | Private |

### Mobile App Authentication

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/mobile/login` | POST | Mobile app login | Public |
| `/mobile/validate-token` | GET | Validate JWT token | Private |
| `/mobile/me` | GET | Get current user profile | Private |
| `/mobile/change-password` | PATCH | Change password | Private |

## Staff Management

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/staff` | GET | Get all staff (with pagination) | Private/Admin |
| `/staff/:id` | GET | Get staff by ID | Private/Admin |
| `/staff` | POST | Create new staff | Private/Admin |
| `/staff/:id` | PUT | Update staff | Private/Admin |
| `/staff/:id/reset-password` | POST | Reset staff password | Private/Admin |
| `/staff/:id/toggle-status` | PATCH | Activate/Deactivate staff | Private/Admin |
| `/staff/:id` | DELETE | Delete staff | Private/Admin |
| `/staff/dashboard/stats` | GET | Get staff statistics | Private/Admin |

## Distributors

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/distributors` | GET | Get all distributors | Private |
| `/distributors/:id` | GET | Get distributor by ID | Private |
| `/distributors` | POST | Create new distributor | Private/Admin |
| `/distributors/:id` | PUT | Update distributor | Private/Admin |
| `/distributors/:id` | DELETE | Delete distributor | Private/Admin |

### Mobile App Distributor Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/mobile/distributors` | GET | Get all distributors | Private |
| `/mobile/distributors/:id` | GET | Get distributor by ID | Private |
| `/mobile/distributors/:id/details` | GET | Get comprehensive distributor details with shops | Private |

## Tasks

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/tasks` | GET | Get all tasks (with filters) | Private |
| `/tasks/:taskId` | GET | Get task by ID | Private |
| `/tasks` | POST | Create new task | Private |
| `/tasks/:taskId` | PATCH | Update task status | Private |

### Mobile App Task Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/mobile/tasks/assigned` | GET | Get tasks assigned to current staff | Private |

## Supply Estimates

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/supply-estimates` | GET | Get all supply estimates (with pagination) | Private |
| `/supply-estimates/:id` | GET | Get supply estimate by ID | Private |
| `/supply-estimates` | POST | Create new supply estimate | Private |
| `/supply-estimates/:id/approve` | PATCH | Approve supply estimate | Private/Manager+ |
| `/supply-estimates/:id/reject` | PATCH | Reject supply estimate | Private/Manager+ |
| `/supply-estimates/distributor/:distributorId` | GET | Get estimates by distributor | Private |
| `/supply-estimates/staff/:staffId` | GET | Get estimates by staff | Private |

### Mobile App Supply Estimate Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/mobile/supply-estimates` | POST | Submit a new supply estimate | Private |
| `/mobile/supply-estimates/my-submissions` | GET | Get current staff's submitted estimates | Private |

## Staff Activity

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/staff-activity` | GET | Get all staff activities (with pagination) | Private/Admin |
| `/staff-activity/staff/:staffId` | GET | Get activities by staff ID | Private |

## Security Features

1. **JWT Authentication**: All private routes require a valid JWT token
2. **Password Security**:
   - Passwords are hashed with bcrypt
   - Password requirements: 8+ characters, uppercase, lowercase, number, special character
3. **Account Protection**:
   - Account lock after 5 failed login attempts (30-minute lockout)
   - Password reset functionality
4. **Rate Limiting**:
   - General API: 100 requests per 15 minutes
   - Auth endpoints: 5 login attempts per hour
5. **Security Headers**: Implemented via Helmet middleware

## Response Format

All API endpoints follow a consistent response format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

or

```json
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication Header

For authenticated endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## Default Admin Credentials

```
Email: admin@example.com
Password: Admin@123
```

## Documentation

Full API documentation is available at:
```
http://localhost:5050/api-docs
``` 