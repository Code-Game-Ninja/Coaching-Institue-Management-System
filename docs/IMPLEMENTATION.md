# IMPLEMENTATION.md — Coaching Institute Data Management System

> Comprehensive implementation guide documenting every file, pattern, and integration in the CIDMS full-stack application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Backend Implementation](#backend-implementation)
   - [Entry Point & Configuration](#entry-point--configuration)
   - [Database Models](#database-models)
   - [Middleware](#middleware)
   - [Utilities](#utilities)
   - [Validators](#validators)
   - [Controllers](#controllers)
   - [Routes](#routes)
   - [Seed Script](#seed-script)
5. [Frontend Implementation](#frontend-implementation)
   - [Build Configuration](#build-configuration)
   - [Core Setup](#core-setup)
   - [State Management](#state-management)
   - [API Layer](#api-layer)
   - [Layout Components](#layout-components)
   - [Common Components](#common-components)
   - [Pages](#pages)
6. [API Reference](#api-reference)
7. [Authentication Flow](#authentication-flow)
8. [Fee Management System](#fee-management-system)
9. [Report Export System](#report-export-system)
10. [Environment Variables](#environment-variables)
11. [Running the Application](#running-the-application)

---

## Architecture Overview

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   React + Vite (5173)   │────▶│  Express API (5000)     │
│   Tailwind CSS          │     │  JWT Auth               │
│   Zustand Store         │     │  Rate Limiting          │
│   React Router DOM      │     │  Helmet Security        │
└─────────────────────────┘     └──────────┬──────────────┘
                                           │
                                ┌──────────▼──────────────┐
                                │  MongoDB (Mongoose 9)   │
                                │  5 Collections          │
                                │  Virtuals + Hooks       │
                                └─────────────────────────┘
```

- **Frontend** runs on port 5173 (Vite dev server) with API proxy to backend
- **Backend** runs on port 5000, serves JSON REST API
- **Database** uses MongoDB with Mongoose ODM
- **Auth** is JWT-based (24h expiry), stored in `localStorage`
- **Module System**: ES Modules throughout (`"type": "module"`)

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.x | Web framework |
| mongoose | ^9.x | MongoDB ODM |
| bcryptjs | ^3.x | Password hashing (saltRounds=12) |
| jsonwebtoken | ^9.x | JWT generation & verification |
| helmet | ^8.x | HTTP security headers |
| cors | latest | Cross-Origin Resource Sharing |
| morgan | latest | HTTP request logging |
| express-rate-limit | ^8.x | Rate limiting |
| express-validator | ^7.x | Request validation & sanitization |
| dotenv | latest | Environment variables |
| exceljs | ^4.x | Excel report generation |
| pdfkit | ^0.17.x | PDF report generation |
| csv-stringify | ^6.x | CSV report generation |
| nodemon | latest (dev) | Auto-restart on changes |

### Frontend
| Package | Purpose |
|---------|---------|
| react + react-dom | UI framework |
| vite + @vitejs/plugin-react | Build tool |
| tailwindcss + postcss + autoprefixer | Styling |
| axios | HTTP client |
| zustand | State management |
| react-router-dom | Client-side routing |
| recharts | Charts & data visualization |
| react-hot-toast | Toast notifications |
| lucide-react | Icon library |

---

## Project Structure

```
coaching-institute-dms/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js       # Login, getMe, changePassword
│   │   ├── student.controller.js    # CRUD + search + filter + pagination
│   │   ├── course.controller.js     # CRUD + studentCount + delete guard
│   │   ├── batch.controller.js      # CRUD + students-in-batch
│   │   ├── payment.controller.js    # CRUD + pending fees
│   │   ├── dashboard.controller.js  # Aggregated stats
│   │   └── report.controller.js     # CSV/Excel/PDF exports
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── errorHandler.middleware.js # Central error handler
│   │   ├── rateLimiter.middleware.js # Login rate limit (10/15min)
│   │   └── validate.middleware.js   # express-validator result check
│   ├── models/
│   │   ├── Admin.model.js           # Admin schema
│   │   ├── Course.model.js          # Course schema
│   │   ├── Batch.model.js           # Batch schema (refs Course)
│   │   ├── Student.model.js         # Student schema (virtuals, text index)
│   │   └── Payment.model.js         # Payment schema (post-save/delete hooks)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── course.routes.js
│   │   ├── batch.routes.js
│   │   ├── payment.routes.js
│   │   ├── dashboard.routes.js
│   │   └── report.routes.js
│   ├── scripts/
│   │   └── seedAdmin.js             # Seeds default admin user
│   ├── utils/
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   └── apiResponse.js           # Standardized JSON responses
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── student.validator.js
│   │   ├── course.validator.js
│   │   ├── batch.validator.js
│   │   └── payment.validator.js
│   ├── app.js                       # Express app setup
│   ├── server.js                    # Entry point
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.api.js          # login, getMe, changePassword
│   │   │   ├── dashboard.api.js     # getDashboardStats
│   │   │   ├── students.api.js      # CRUD + search
│   │   │   ├── courses.api.js       # CRUD
│   │   │   ├── batches.api.js       # CRUD
│   │   │   ├── payments.api.js      # CRUD + pendingFees
│   │   │   └── reports.api.js       # Export + downloadBlob utility
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx        # 5 color variants
│   │   │   │   ├── EmptyState.jsx   # Placeholder UI
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx        # Reusable dialog
│   │   │   │   ├── Pagination.jsx   # Previous/Next + page numbers
│   │   │   │   ├── SearchBar.jsx    # Input with clear button
│   │   │   │   └── StatCard.jsx     # Dashboard stat display
│   │   │   └── layout/
│   │   │       ├── DashboardLayout.jsx  # Sidebar + main content
│   │   │       ├── Sidebar.jsx          # Nav items + logout
│   │   │       └── TopBar.jsx           # Page title + admin name
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Auth page
│   │   │   ├── Dashboard.jsx        # Stats + charts + tables
│   │   │   ├── Students.jsx         # Student list + CRUD
│   │   │   ├── StudentProfile.jsx   # Detail view + payments
│   │   │   ├── Courses.jsx          # Course management
│   │   │   ├── Batches.jsx          # Batch management
│   │   │   ├── Payments.jsx         # Payment records + pending
│   │   │   └── Reports.jsx          # Export downloads
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   ├── store/
│   │   │   └── authStore.js         # Zustand auth state
│   │   ├── utils/
│   │   │   └── axios.config.js      # Axios instance + interceptors
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # React root + providers
│   │   └── index.css                # Tailwind directives
│   ├── index.html                   # SPA entry
│   ├── vite.config.js               # Vite config + API proxy
│   ├── tailwind.config.js           # Custom primary palette
│   ├── postcss.config.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
```

---

## Backend Implementation

### Entry Point & Configuration

#### `server.js`
- Loads environment variables via `dotenv/config`
- Calls `connectDB()` to connect to MongoDB
- Imports and starts the Express `app` on `process.env.PORT` (default: 5000)

#### `app.js`
- Creates Express app with security middleware stack:
  1. `helmet()` — sets security HTTP headers
  2. `cors({ origin: process.env.FRONTEND_URL })` — whitelist frontend origin
  3. `express.json({ limit: '10mb' })` — parse JSON bodies
  4. `morgan('dev')` — request logging
  5. Global rate limiter: 200 requests per 15 minutes per IP
- Mounts 7 route groups under `/api/*`
- 404 handler for unknown routes
- Central error handler middleware

#### `config/db.js`
- `connectDB()` uses `mongoose.connect(process.env.MONGO_URI)`
- Logs success or exits process on failure

### Database Models

#### Admin (`models/Admin.model.js`)
```
Fields: name (String, required), email (String, unique, lowercase), password (String, select: false)
```
- Password field excluded from queries by default (`select: false`)
- Timestamps enabled

#### Course (`models/Course.model.js`)
```
Fields: name (String, unique, required), duration (String, required), totalFees (Number, required, min: 0),
        description (String), isActive (Boolean, default: true)
```
- Timestamps enabled

#### Batch (`models/Batch.model.js`)
```
Fields: name (String, required), course (ObjectId → Course), teacher (String),
        startDate (Date, required), endDate (Date, required), timing (String), isActive (Boolean)
```
- Validator: `endDate` must be after `startDate`
- Timestamps enabled

#### Student (`models/Student.model.js`)
```
Fields: name, phone (unique, regex: /^[6-9]\d{9}$/), email, address,
        course (ObjectId → Course), batch (ObjectId → Batch),
        admissionDate, totalFees, feesPaid (default: 0), photo, status (enum: active/inactive/completed)
```
- **Virtual `remainingFees`**: `totalFees - feesPaid`
- **Virtual `feeStatus`**: Returns 'cleared', 'partial', or 'unpaid'
- **Text index** on `name` and `phone` for search
- Virtuals enabled in JSON/Object serialization

#### Payment (`models/Payment.model.js`)
```
Fields: student (ObjectId → Student), amount (Number, min: 1), paymentMode (enum: Cash/UPI/Bank Transfer),
        paymentDate, notes, recordedBy (ObjectId → Admin)
```
- **Post-save hook**: Increments `student.feesPaid` by `amount`
- **Post-findOneAndDelete hook**: Decrements `student.feesPaid` by `amount`
- This ensures fee totals stay in sync automatically

### Middleware

#### `auth.middleware.js` — `verifyToken`
1. Extracts `Bearer <token>` from `Authorization` header
2. Verifies with `jwt.verify(token, JWT_SECRET)`
3. Fetches admin from DB (excludes password)
4. Attaches `req.admin` for downstream use
5. Returns 401 on missing/invalid token

#### `errorHandler.middleware.js`
Handles specific error types:
- **Mongoose duplicate key (code 11000)**: Returns 409 with field name
- **Mongoose ValidationError**: Returns 400 with field-level messages
- **Mongoose CastError**: Returns 400 "Invalid ID"
- **JWT errors**: Returns 401 "Invalid/expired token"
- **Default**: Returns 500

#### `rateLimiter.middleware.js`
- `loginLimiter`: 10 requests per 15 minutes per IP on login endpoint
- Returns standard JSON error response on limit exceeded

#### `validate.middleware.js`
- Checks `validationResult(req)` from express-validator
- Returns 400 with array of field errors if validation fails

### Utilities

#### `asyncHandler.js`
Wraps async route handlers to catch errors and pass to `next()`:
```js
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

#### `apiResponse.js`
Three helper functions:
- `successResponse(res, data, message, statusCode)` — standard success
- `paginatedResponse(res, items, pagination)` — list with pagination metadata
- `errorResponse(res, message, statusCode)` — error response

### Validators

Each validator file exports arrays of express-validator chains with sanitization (`.escape()`, `.normalizeEmail()`):

| File | Exports |
|------|---------|
| `auth.validator.js` | `loginValidator`, `changePasswordValidator` |
| `student.validator.js` | `createStudentValidator`, `updateStudentValidator` |
| `course.validator.js` | `createCourseValidator`, `updateCourseValidator` |
| `batch.validator.js` | `createBatchValidator`, `updateBatchValidator` |
| `payment.validator.js` | `createPaymentValidator` |

### Controllers

#### Auth Controller
| Method | Function | Logic |
|--------|----------|-------|
| POST | `login` | Find admin by email → bcrypt.compare → sign JWT (24h) → return token + admin |
| GET | `getMe` | Return `req.admin` (from auth middleware) |
| PUT | `changePassword` | Verify current password → hash new → update in DB |

#### Student Controller
| Method | Function | Logic |
|--------|----------|-------|
| GET | `getStudents` | Search (text index) + filter (course, batch, status) + feeStatus virtual filter + pagination (default: 20/page) |
| GET | `getStudent` | Find by ID, populate course/batch, attach paymentHistory |
| POST | `createStudent` | Create with validated body |
| PUT | `updateStudent` | Update (blocks feesPaid manipulation via $set guard) |
| DELETE | `deleteStudent` | Delete student + cascade delete all related payments |

#### Course Controller
| Method | Function | Logic |
|--------|----------|-------|
| GET | `getCourses` | List all with `studentCount` (aggregated) |
| GET | `getCourse` | Single course + related batches |
| POST | `createCourse` | Create new |
| PUT | `updateCourse` | Update existing |
| DELETE | `deleteCourse` | **Guard**: Fails with 400 if students are enrolled |

#### Batch Controller
| Method | Function | Logic |
|--------|----------|-------|
| GET | `getBatches` | Optional course filter, populate course name |
| GET | `getBatch` | Single batch + course details |
| GET | `getBatchStudents` | Students enrolled in a specific batch |
| POST | `createBatch` | Create new batch |
| PUT | `updateBatch` | Update existing |
| DELETE | `deleteBatch` | **Guard**: Fails with 400 if students are enrolled |

#### Payment Controller
| Method | Function | Logic |
|--------|----------|-------|
| GET | `getPayments` | Paginated list, populate student name |
| GET | `getPendingFees` | Students where `feesPaid < totalFees` |
| POST | `createPayment` | Validates amount <= remaining fees, saves payment (hook updates student) |
| DELETE | `deletePayment` | Deletes payment (hook decrements student feesPaid) |

#### Dashboard Controller
| Method | Function | Logic |
|--------|----------|-------|
| GET | `getDashboardStats` | Returns: totalStudents, activeStudents, totalCourses, totalBatches, totalRevenue (via $group aggregation), totalPendingFees, recentStudents (5), recentPayments (5) |

#### Report Controller
| Method | Function | Logic |
|--------|----------|-------|
| GET | `exportStudents` | Query param `format=csv|excel|pdf`. Generates file server-side and streams to client |
| GET | `exportPayments` | Query param `format=csv|excel`. Generates payment report |

### Routes

All routes (except auth) are protected with `verifyToken` middleware:

| Route Group | Base Path | Auth |
|-------------|-----------|------|
| Auth | `/api/auth` | Public (login), Protected (me, change-password) |
| Students | `/api/students` | Protected |
| Courses | `/api/courses` | Protected |
| Batches | `/api/batches` | Protected |
| Payments | `/api/payments` | Protected |
| Dashboard | `/api/dashboard` | Protected |
| Reports | `/api/reports` | Protected |

### Seed Script

`scripts/seedAdmin.js` creates the default admin:
- **Email**: admin@institute.com
- **Password**: Admin@123
- **Name**: Super Admin
- Hashes password with bcrypt (saltRounds=12) before insert
- Run via: `npm run seed:admin`

---

## Frontend Implementation

### Build Configuration

#### `vite.config.js`
- React plugin enabled
- **API proxy**: `/api` requests proxied to `http://localhost:5000` during development
- This eliminates CORS issues in dev mode

#### `tailwind.config.js`
- Custom `primary` color palette (shades 50–950) based on blue (#1e3a8a → #3b82f6)
- Content paths: `./index.html`, `./src/**/*.{js,jsx}`

### Core Setup

#### `main.jsx`
- `ReactDOM.createRoot` with `<BrowserRouter>` and `<Toaster>` (react-hot-toast)

#### `App.jsx`
Route structure:
```
/login              → Login page (public)
/                   → DashboardLayout (protected)
  /dashboard        → Dashboard
  /students         → Students list
  /students/:id     → Student profile
  /courses          → Courses management
  /batches          → Batches management
  /payments         → Payment records
  /reports          → Report downloads
*                   → Redirect to /dashboard
```

### State Management

#### `authStore.js` (Zustand)
```
State: token, admin, isAuthenticated
Actions: login(token, admin), logout(), updateAdmin(admin)
```
- Persists `token` and `admin` to `localStorage`
- `login()` saves to both store and localStorage
- `logout()` clears everything and redirects to `/login`

### API Layer

#### `axios.config.js`
- Base URL from `VITE_API_URL` env var
- **Request interceptor**: Attaches `Authorization: Bearer <token>` header
- **Response interceptor**: On 401, clears auth and redirects to `/login`

#### API Files Pattern
Each API file exports functions that call the axios instance:
```js
export const getStudentsAPI = (params) => api.get('/students', { params });
export const createStudentAPI = (data) => api.post('/students', data);
// etc.
```

#### `reports.api.js` — Special
- Uses `responseType: 'blob'` for file downloads
- Includes `downloadBlob(blob, filename)` utility that creates temporary download link

### Layout Components

#### `Sidebar.jsx`
- 6 navigation items: Dashboard, Students, Courses, Batches, Payments, Reports
- Each with lucide-react icon
- Active route highlighted with primary-700 background
- Logout button at bottom
- GraduationCap logo branding
- Dark navy (primary-900) background

#### `TopBar.jsx`
- Shows current page title
- Displays admin name from auth store

#### `DashboardLayout.jsx`
- Fixed sidebar (w-64) + scrollable main content area
- Uses `<Outlet />` for nested routes

### Common Components

| Component | Props | Description |
|-----------|-------|-------------|
| `LoadingSpinner` | — | Centered spinner animation |
| `Badge` | variant (success/warning/danger/info/default), children | Color-coded status label |
| `StatCard` | title, value, icon, color (6 options) | Dashboard metric display |
| `SearchBar` | value, onChange, placeholder | Input with clear (X) button |
| `Modal` | isOpen, onClose, title, children, maxWidth | Backdrop overlay + dialog |
| `Pagination` | page, totalPages, onPageChange | Previous/Next + numbered pages |
| `EmptyState` | title, message | Placeholder for empty lists |

### Pages

#### `Login.jsx`
- Gradient background (primary-900 → primary-700)
- Email + password form with show/hide toggle (Eye/EyeOff icons)
- Loading spinner on submit button
- Calls `loginAPI` → stores token in auth store → navigates to `/dashboard`
- Toast notifications on success/error

#### `Dashboard.jsx`
- 6 `StatCard` components in responsive grid:
  - Total Students, Active Students, Total Courses, Total Batches, Total Revenue, Pending Fees
- **Recharts BarChart**: Revenue overview (monthly or per-course)
- **Recent Students table**: Last 5 students with fee status badges
- **Recent Payments table**: Last 5 payments with mode badges
- All data fetched from `/api/dashboard`

#### `Students.jsx`
- **Toolbar**: SearchBar + Course filter dropdown + Status filter dropdown + Add button
- **Table**: Name, Phone, Course, Batch, Fees (paid/total + badge), Status, Actions (View/Edit/Delete)
- **Pagination**: Server-side pagination (20 per page)
- **Add/Edit Modal**: Name, Phone, Email, Admission Date, Course (loads batches on select), Batch, Total Fees, Address
- **Delete**: Confirmation dialog → cascade deletes payments

#### `StudentProfile.jsx`
- **Back link** to Students list
- **Profile card**: Avatar (initial letter), name, status badge, contact info, course/batch, admission date
- **Fee summary**: 3 cards — Total Fees, Fees Paid (green), Remaining (red if > 0)
- **Payment history table**: Date, Amount, Mode badge, Notes
- **Edit modal**: Same fields as Students.jsx add form + status
- **Delete button** with confirmation

#### `Courses.jsx`
- **Card grid** layout (sm:2 cols, lg:3 cols)
- Each card: Course name, duration, active/inactive badge, description (2-line clamp), fees, student count
- Edit/Delete buttons per card
- **Add/Edit Modal**: Name, Duration, Total Fees, Description, isActive checkbox
- **Delete guard**: Backend returns error if students enrolled

#### `Batches.jsx`
- **Course filter** dropdown + batch count
- **Table**: Batch Name, Course, Teacher, Timing, Duration (start-end dates), Student Count, Status, Actions
- **Add/Edit Modal**: Name, Course dropdown, Teacher, Timing, Start Date, End Date, isActive checkbox
- **Delete guard**: Backend returns error if students enrolled

#### `Payments.jsx`
- **Tab toggle**: "All Payments" | "Pending Fees"
- **All Payments tab**: Paginated table — Student, Amount, Mode badge, Date, Notes, Delete button
- **Pending Fees tab**: Table — Student, Course, Total Fees, Paid, Remaining (red)
- **Record Payment Modal**: Student dropdown (shows fee info), Amount (max = remaining), Mode select, Date, Notes

#### `Reports.jsx`
- 5 report cards in responsive grid:
  1. Students CSV
  2. Students Excel
  3. Students PDF
  4. Payments CSV
  5. Payments Excel
- Each card: Icon, title, description, Download button with loading state
- Downloads via blob URL creation

---

## API Reference

### Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ token, admin }` |
| GET | `/api/auth/me` | — | `{ admin }` |
| PUT | `/api/auth/change-password` | `{ currentPassword, newPassword }` | `{ message }` |

### Students
| Method | Endpoint | Params/Body | Response |
|--------|----------|-------------|----------|
| GET | `/api/students` | `?search&course&batch&status&page&limit` | Paginated students |
| GET | `/api/students/:id` | — | Student + paymentHistory |
| POST | `/api/students` | Student fields | Created student |
| PUT | `/api/students/:id` | Partial student fields | Updated student |
| DELETE | `/api/students/:id` | — | Success message |

### Courses
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/courses` | — | All courses + studentCount |
| GET | `/api/courses/:id` | — | Course + batches |
| POST | `/api/courses` | `{ name, duration, totalFees, description?, isActive? }` | Created course |
| PUT | `/api/courses/:id` | Partial fields | Updated course |
| DELETE | `/api/courses/:id` | — | Success (or 400 if students enrolled) |

### Batches
| Method | Endpoint | Params/Body | Response |
|--------|----------|-------------|----------|
| GET | `/api/batches` | `?course` | All batches |
| GET | `/api/batches/:id` | — | Single batch |
| GET | `/api/batches/:id/students` | — | Students in batch |
| POST | `/api/batches` | Batch fields | Created batch |
| PUT | `/api/batches/:id` | Partial fields | Updated batch |
| DELETE | `/api/batches/:id` | — | Success (or 400 if students enrolled) |

### Payments
| Method | Endpoint | Params/Body | Response |
|--------|----------|-------------|----------|
| GET | `/api/payments` | `?page&limit` | Paginated payments |
| GET | `/api/payments/pending` | — | Students with pending fees |
| POST | `/api/payments` | `{ student, amount, paymentMode, paymentDate?, notes? }` | Created payment |
| DELETE | `/api/payments/:id` | — | Success message |

### Dashboard
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/dashboard` | `{ totalStudents, activeStudents, totalCourses, totalBatches, totalRevenue, totalPendingFees, recentStudents, recentPayments }` |

### Reports
| Method | Endpoint | Params | Response |
|--------|----------|--------|----------|
| GET | `/api/reports/students` | `?format=csv|excel|pdf` | File download |
| GET | `/api/reports/payments` | `?format=csv|excel` | File download |

---

## Authentication Flow

```
1. Admin enters email + password on Login page
2. POST /api/auth/login
3. Server: Find admin → bcrypt.compare → JWT sign (24h)
4. Client: Store token + admin in Zustand + localStorage
5. All subsequent API calls: axios interceptor adds "Authorization: Bearer <token>"
6. On 401 response: interceptor clears auth → redirect to /login
7. ProtectedRoute checks isAuthenticated → redirects to /login if false
```

---

## Fee Management System

The fee system uses Mongoose middleware (hooks) for automatic consistency:

```
1. Admin creates a Student with totalFees (e.g., ₹50,000), feesPaid starts at 0
2. Admin records Payment (e.g., ₹20,000)
   → Payment model post-save hook: student.feesPaid += 20,000
   → Student now: feesPaid = 20,000, remainingFees (virtual) = 30,000
3. Admin records another Payment (₹15,000)
   → student.feesPaid += 15,000 = 35,000
   → feeStatus virtual = "partial"
4. If admin deletes a payment:
   → Payment model post-findOneAndDelete hook: student.feesPaid -= amount
5. Dashboard aggregation: SUM of (totalFees - feesPaid) across all students = totalPendingFees
```

**Guards:**
- Payment amount validated: `amount <= (student.totalFees - student.feesPaid)`
- Student `feesPaid` cannot be directly modified via PUT endpoint

---

## Report Export System

### CSV (via csv-stringify)
- Server queries all students/payments
- Pipes through csv-stringify transformer
- Sets `Content-Type: text/csv` + `Content-Disposition: attachment; filename=...`

### Excel (via ExcelJS)
- Creates workbook + worksheet
- Adds styled header row
- Populates data rows
- Writes to response stream with `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### PDF (via PDFKit)
- Creates PDF document
- Adds title + timestamp
- Draws table with headers and data rows
- Pipes to response with `application/pdf`

### Frontend Download
```js
const response = await exportStudentsReport('excel'); // returns blob
const url = URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.download = 'students.xlsx';
link.click();
URL.revokeObjectURL(url);
```

---

## Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/coaching-institute
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Application

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Clone and enter project
cd coaching-institute-dms

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run seed:admin    # Creates default admin: admin@institute.com / Admin@123
npm run dev           # Starts on port 5000

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev           # Starts on port 5173

# 4. Open http://localhost:5173 in browser
# Login with: admin@institute.com / Admin@123
```

### Available Scripts

**Backend:**
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon server.js` | Development with auto-restart |
| `start` | `node server.js` | Production start |
| `seed:admin` | `node scripts/seedAdmin.js` | Seed default admin |

**Frontend:**
| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Development server (5173) |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |

---

*This document is auto-generated and reflects the actual implementation state of the CIDMS project.*
