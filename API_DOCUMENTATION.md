# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "Engineering",
  "role": "employee" // optional, defaults to "employee"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "employee",
  "employeeId": "EMP001",
  "department": "Engineering",
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "employee",
  "employeeId": "EMP001",
  "department": "Engineering",
  "token": "jwt_token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "employee",
  "employeeId": "EMP001",
  "department": "Engineering"
}
```

### Attendance (Employee)

#### Check In
```http
POST /api/attendance/checkin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "attendance_id",
  "userId": "user_id",
  "date": "2024-01-15T00:00:00.000Z",
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "status": "present",
  "totalHours": 0
}
```

#### Check Out
```http
POST /api/attendance/checkout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "attendance_id",
  "userId": "user_id",
  "date": "2024-01-15T00:00:00.000Z",
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "checkOutTime": "2024-01-15T17:00:00.000Z",
  "status": "present",
  "totalHours": 8
}
```

#### Get Today's Status
```http
GET /api/attendance/today
Authorization: Bearer <token>
```

**Response:**
```json
{
  "checkedIn": true,
  "checkedOut": false,
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "status": "present",
  "totalHours": 0
}
```

#### Get My Attendance History
```http
GET /api/attendance/my-history?month=1&year=2024
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2024)

**Response:**
```json
[
  {
    "_id": "attendance_id",
    "userId": "user_id",
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "checkOutTime": "2024-01-15T17:00:00.000Z",
    "status": "present",
    "totalHours": 8
  }
]
```

#### Get My Monthly Summary
```http
GET /api/attendance/my-summary?month=1&year=2024
Authorization: Bearer <token>
```

**Response:**
```json
{
  "month": 1,
  "year": 2024,
  "present": 20,
  "absent": 5,
  "late": 2,
  "halfDay": 1,
  "totalHours": 160.5,
  "totalDays": 28
}
```

### Attendance (Manager)

#### Get All Employees Attendance
```http
GET /api/attendance/all?employeeId=EMP001&startDate=2024-01-01&endDate=2024-01-31&status=present&department=Engineering
Authorization: Bearer <token>
```

**Query Parameters:**
- `employeeId` (optional): Filter by employee ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `status` (optional): Filter by status (present/absent/late/half-day)
- `department` (optional): Filter by department

**Response:**
```json
[
  {
    "_id": "attendance_id",
    "userId": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "employeeId": "EMP001",
      "department": "Engineering"
    },
    "date": "2024-01-15T00:00:00.000Z",
    "checkInTime": "2024-01-15T09:00:00.000Z",
    "checkOutTime": "2024-01-15T17:00:00.000Z",
    "status": "present",
    "totalHours": 8
  }
]
```

#### Get Employee Attendance
```http
GET /api/attendance/employee/:id?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:** Same as above

#### Get Team Summary
```http
GET /api/attendance/summary?month=1&year=2024
Authorization: Bearer <token>
```

**Response:**
```json
{
  "month": 1,
  "year": 2024,
  "totalEmployees": 10,
  "present": 200,
  "absent": 50,
  "late": 15,
  "halfDay": 5,
  "totalHours": 1600
}
```

#### Get Today's Status (All Employees)
```http
GET /api/attendance/today-status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "present": 8,
  "absent": 2,
  "late": 1,
  "presentEmployees": [...],
  "absentEmployees": [...]
}
```

#### Export Attendance (CSV)
```http
GET /api/attendance/export?startDate=2024-01-01&endDate=2024-01-31&employeeId=EMP001&department=Engineering&status=present
Authorization: Bearer <token>
```

**Response:** CSV file download

### Dashboard

#### Get Employee Dashboard
```http
GET /api/dashboard/employee
Authorization: Bearer <token>
```

**Response:**
```json
{
  "todayStatus": {
    "checkedIn": true,
    "checkedOut": false,
    "status": "present",
    "checkInTime": "2024-01-15T09:00:00.000Z"
  },
  "monthlyStats": {
    "present": 20,
    "absent": 5,
    "late": 2,
    "totalHours": 160.5
  },
  "recentAttendance": [...]
}
```

#### Get Manager Dashboard
```http
GET /api/dashboard/manager
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalEmployees": 10,
  "todayStats": {
    "present": 8,
    "absent": 2,
    "late": 1
  },
  "absentEmployeesToday": [...],
  "weeklyTrend": [...],
  "departmentStats": [...]
}
```

### Users (Manager Only)

#### Get All Users
```http
GET /api/users/all
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "employeeId": "EMP001",
    "department": "Engineering",
    "role": "employee"
  }
]
```

#### Get Departments
```http
GET /api/users/departments
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "department": "Engineering",
    "employeeCount": 5
  }
]
```

#### Get Employee Details
```http
GET /api/users/employee/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "employeeId": "EMP001",
  "department": "Engineering",
  "role": "employee"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting
Currently not implemented. Consider adding rate limiting for production.

## Versioning
Current version: v1.0

