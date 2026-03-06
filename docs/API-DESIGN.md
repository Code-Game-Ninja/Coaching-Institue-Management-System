# API Design Document
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Author:** Backend Specialist Agent  
> **Style:** REST — JSON over HTTPS  
> **Base URL (dev):** `http://localhost:5000/api`  
> **Base URL (prod):** `https://your-api.onrender.com/api`  

---

## 📑 Table of Contents

1. [API Conventions](#1-api-conventions)
2. [Authentication Endpoints](#2-authentication-endpoints)
3. [Dashboard Endpoints](#3-dashboard-endpoints)
4. [Student Endpoints](#4-student-endpoints)
5. [Course Endpoints](#5-course-endpoints)
6. [Batch Endpoints](#6-batch-endpoints)
7. [Payment Endpoints](#7-payment-endpoints)
8. [Reports Endpoints](#8-reports-endpoints)
9. [Error Response Reference](#9-error-response-reference)
10. [Axios Config (Frontend)](#10-axios-config-frontend)

---

## 1. API Conventions

### Request Headers (Protected Routes)

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Standard Success Response Shape

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Paginated List Response Shape

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

### Standard Error Response Shape

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Common Query Parameters (List endpoints)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `search` | string | Text search on name/phone |
| `sort` | string | Field to sort by (prefix `-` for desc) |

---

## 2. Authentication Endpoints

### POST /api/auth/login

Login with email and password.

**Auth required:** ❌ (public)

**Request Body:**
```json
{
  "email": "admin@institute.com",
  "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h",
    "admin": {
      "_id": "64abc...",
      "name": "Institute Admin",
      "email": "admin@institute.com"
    }
  }
}
```

**Error Responses:**
- `400` — Missing fields
- `401` — Invalid email or password

---

### GET /api/auth/me

Get current logged-in admin profile.

**Auth required:** ✅ JWT

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64abc...",
    "name": "Institute Admin",
    "email": "admin@institute.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /api/auth/change-password

Change admin password.

**Auth required:** ✅ JWT

**Request Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecure@456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` — New password too short (< 6 chars)
- `401` — Current password is wrong

---

## 3. Dashboard Endpoints

### GET /api/dashboard/stats

Get all dashboard summary statistics in one call.

**Auth required:** ✅ JWT

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 247,
      "totalCourses": 8,
      "totalRevenue": 1245000,
      "totalPendingFees": 328500,
      "activeStudents": 231,
      "totalBatches": 12
    },
    "recentStudents": [
      {
        "_id": "64abc...",
        "name": "Rahul Sharma",
        "course": { "_id": "...", "name": "JEE Mains" },
        "batch": { "_id": "...", "name": "Morning Batch A" },
        "admissionDate": "2026-03-01T00:00:00.000Z",
        "feeStatus": "pending"
      }
    ],
    "recentPayments": [
      {
        "_id": "64def...",
        "student": { "_id": "...", "name": "Rahul Sharma" },
        "amount": 5000,
        "paymentMode": "UPI",
        "paymentDate": "2026-03-05T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 4. Student Endpoints

### GET /api/students

Get paginated list of students with search and filters.

**Auth required:** ✅ JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |
| `search` | string | Search by name or phone |
| `course` | ObjectId | Filter by course ID |
| `batch` | ObjectId | Filter by batch ID |
| `feeStatus` | string | `pending` or `cleared` |
| `status` | string | `active`, `inactive`, `completed` |
| `sort` | string | e.g., `-createdAt`, `name` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "64abc...",
        "name": "Rahul Sharma",
        "phone": "9876543210",
        "email": "rahul@example.com",
        "course": { "_id": "...", "name": "JEE Mains" },
        "batch": { "_id": "...", "name": "Morning Batch A" },
        "admissionDate": "2026-01-15T00:00:00.000Z",
        "totalFees": 15000,
        "feesPaid": 10000,
        "remainingFees": 5000,
        "feeStatus": "pending",
        "status": "active",
        "photo": "https://res.cloudinary.com/..."
      }
    ],
    "pagination": {
      "total": 247,
      "page": 1,
      "limit": 20,
      "totalPages": 13
    }
  }
}
```

---

### GET /api/students/:id

Get single student with full profile and payment history.

**Auth required:** ✅ JWT

**Path Params:** `id` — Student ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "64abc...",
      "name": "Rahul Sharma",
      "phone": "9876543210",
      "email": "rahul@example.com",
      "address": "123 Main St, Delhi",
      "course": { "_id": "...", "name": "JEE Mains", "duration": "1 year" },
      "batch": { "_id": "...", "name": "Morning Batch A", "timing": "9:00 AM – 11:00 AM" },
      "admissionDate": "2026-01-15T00:00:00.000Z",
      "totalFees": 15000,
      "feesPaid": 10000,
      "remainingFees": 5000,
      "feeStatus": "pending",
      "status": "active",
      "photo": ""
    },
    "paymentHistory": [
      {
        "_id": "64def...",
        "amount": 5000,
        "paymentMode": "Cash",
        "paymentDate": "2026-01-15T00:00:00.000Z",
        "notes": "First installment"
      },
      {
        "_id": "64ghi...",
        "amount": 5000,
        "paymentMode": "UPI",
        "paymentDate": "2026-02-10T00:00:00.000Z",
        "notes": ""
      }
    ]
  }
}
```

**Error Responses:**
- `404` — Student not found

---

### POST /api/students

Add a new student.

**Auth required:** ✅ JWT

**Request Body:**
```json
{
  "name": "Priya Singh",
  "phone": "9123456789",
  "email": "priya@example.com",
  "address": "456 Park Ave, Mumbai",
  "course": "64abc...",
  "batch": "64def...",
  "admissionDate": "2026-03-06",
  "totalFees": 12000,
  "photo": ""
}
```

**Validation Rules:**
- `name`: required, string, max 100 chars
- `phone`: required, unique, 10-digit Indian mobile
- `email`: optional, valid email if provided
- `course`: required, valid ObjectId, must exist
- `batch`: required, valid ObjectId, must exist, must belong to course
- `totalFees`: required, number, >= 0
- `admissionDate`: optional, ISO date string

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student added successfully",
  "data": { ... student object ... }
}
```

**Error Responses:**
- `400` — Validation error
- `409` — Phone number already registered

---

### PUT /api/students/:id

Update student details.

**Auth required:** ✅ JWT

**Request Body:** (all fields optional, only send what changed)
```json
{
  "name": "Priya Singh Kumar",
  "phone": "9123456789",
  "address": "New Address, Mumbai"
}
```

**Note:** `feesPaid` and `remainingFees` are NOT directly editable here — use the Payments endpoint.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": { ... updated student ... }
}
```

**Error Responses:**
- `404` — Student not found
- `409` — Phone number conflict

---

### DELETE /api/students/:id

Delete a student and all their payment records.

**Auth required:** ✅ JWT

**Success Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Error Responses:**
- `404` — Student not found

---

## 5. Course Endpoints

### GET /api/courses

Get all courses (no pagination needed, courses are few).

**Auth required:** ✅ JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `isActive` | boolean | Filter active/inactive |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc...",
      "name": "JEE Mains",
      "duration": "1 year",
      "totalFees": 25000,
      "description": "Complete JEE preparation",
      "isActive": true,
      "studentCount": 45
    }
  ]
}
```

---

### GET /api/courses/:id

Get single course with its batches.

**Auth required:** ✅ JWT

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "course": { ... },
    "batches": [ ... list of batches for this course ... ]
  }
}
```

---

### POST /api/courses

Create a new course.

**Auth required:** ✅ JWT

**Request Body:**
```json
{
  "name": "NEET Preparation",
  "duration": "2 years",
  "totalFees": 35000,
  "description": "Full NEET syllabus with test series"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` — Validation error
- `409` — Course name already exists

---

### PUT /api/courses/:id

Update a course.

**Auth required:** ✅ JWT

**Note:** Updating `totalFees` does NOT retroactively change enrolled students' `totalFees`.

**Success Response (200):** Standard

---

### DELETE /api/courses/:id

Delete a course.

**Auth required:** ✅ JWT

**Guard:** Cannot delete if students are enrolled.

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot delete course: 45 students are enrolled. Transfer or remove students first."
}
```

---

## 6. Batch Endpoints

### GET /api/batches

Get all batches (optionally filtered by course).

**Auth required:** ✅ JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `course` | ObjectId | Filter batches by course |
| `isActive` | boolean | Filter active/inactive |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc...",
      "name": "Morning Batch A",
      "course": { "_id": "...", "name": "JEE Mains" },
      "teacher": "Mr. Ramesh Kumar",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "timing": "9:00 AM – 11:00 AM",
      "isActive": true,
      "studentCount": 22
    }
  ]
}
```

---

### GET /api/batches/:id/students

Get all students in a specific batch.

**Auth required:** ✅ JWT

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "batch": { "_id": "...", "name": "Morning Batch A" },
    "students": [ ... student list ... ],
    "totalStudents": 22
  }
}
```

---

### POST /api/batches

Create a new batch.

**Auth required:** ✅ JWT

**Request Body:**
```json
{
  "name": "Evening Batch B",
  "course": "64abc...",
  "teacher": "Ms. Priya Gupta",
  "startDate": "2026-04-01",
  "endDate": "2027-03-31",
  "timing": "5:00 PM – 7:00 PM"
}
```

**Success Response (201):** Standard

---

### PUT /api/batches/:id

Update batch details.

**Auth required:** ✅ JWT

---

### DELETE /api/batches/:id

Delete a batch.

**Auth required:** ✅ JWT

**Guard:** Cannot delete if students are enrolled.

---

## 7. Payment Endpoints

### GET /api/payments

Get all payments with filters (for payment history view).

**Auth required:** ✅ JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `student` | ObjectId | Filter by student |
| `paymentMode` | string | `Cash`, `UPI`, `Bank Transfer` |
| `startDate` | ISO date | Filter from date |
| `endDate` | ISO date | Filter to date |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "64abc...",
        "student": { "_id": "...", "name": "Rahul Sharma", "phone": "9876543210" },
        "amount": 5000,
        "paymentMode": "UPI",
        "paymentDate": "2026-03-05T00:00:00.000Z",
        "notes": "March installment",
        "recordedBy": { "_id": "...", "name": "Institute Admin" }
      }
    ],
    "pagination": { "total": 85, "page": 1, "limit": 20, "totalPages": 5 }
  }
}
```

---

### GET /api/payments/pending

Get all students with pending fees.

**Auth required:** ✅ JWT

**Query Parameters:** `page`, `limit`, `course`, `batch`, `sort`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "64abc...",
        "name": "Rahul Sharma",
        "phone": "9876543210",
        "course": { "name": "JEE Mains" },
        "batch": { "name": "Morning Batch A" },
        "totalFees": 15000,
        "feesPaid": 10000,
        "remainingFees": 5000
      }
    ],
    "pagination": { ... },
    "totalPendingAmount": 328500
  }
}
```

---

### POST /api/payments

Record a new payment.

**Auth required:** ✅ JWT

**Request Body:**
```json
{
  "student": "64abc...",
  "amount": 5000,
  "paymentMode": "UPI",
  "paymentDate": "2026-03-06",
  "notes": "March installment"
}
```

**Validations:**
- `student`: required, valid ObjectId, must exist
- `amount`: required, number > 0, must not exceed `remainingFees`
- `paymentMode`: required, must be `Cash`, `UPI`, or `Bank Transfer`
- `paymentDate`: optional, ISO date

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": { ... },
    "student": {
      "feesPaid": 15000,
      "remainingFees": 0,
      "feeStatus": "cleared"
    }
  }
}
```

**Error Responses:**
- `400` — Amount exceeds remaining fees
- `404` — Student not found

---

### DELETE /api/payments/:id

Delete/reverse a payment (with fee recalculation).

**Auth required:** ✅ JWT

**Note:** This decrements `student.feesPaid` by the deleted amount. Audit use only.

---

## 8. Reports Endpoints

### GET /api/reports/students

Export student list.

**Auth required:** ✅ JWT

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `format` | string | `csv`, `excel`, or `pdf` |
| `course` | ObjectId | Filter by course |
| `batch` | ObjectId | Filter by batch |
| `status` | string | Filter by status |

**Response:** File download  
- `csv` → `Content-Type: text/csv`
- `excel` → `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `pdf` → `Content-Type: application/pdf`

---

### GET /api/reports/fees

Export fees report.

**Auth required:** ✅ JWT

**Query Parameters:** `format`, `feeStatus` (`pending` | `cleared` | `all`), `course`, `batch`

---

### GET /api/reports/payments

Export payment history.

**Auth required:** ✅ JWT

**Query Parameters:** `format`, `startDate`, `endDate`, `paymentMode`, `student`

---

## 9. Error Response Reference

| Code | When |
|------|------|
| `400` | Validation failed, bad input, business rule violation |
| `401` | Missing or invalid JWT token |
| `403` | Valid token but insufficient permissions (future multi-role) |
| `404` | Resource not found |
| `409` | Duplicate key (phone, email, course name) |
| `422` | Unprocessable entity (data conflicts) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 10. Axios Config (Frontend)

```javascript
// frontend/src/utils/axios.config.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cidms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cidms_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

---

*Next: See [UI-UX-SPEC.md](./UI-UX-SPEC.md) for design system and wireframes.*
