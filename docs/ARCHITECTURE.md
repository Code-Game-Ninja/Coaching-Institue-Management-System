# Technical Architecture Document
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Author:** Backend Specialist + Database Architect Agents  
> **Status:** Approved  

---

## 📑 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Tech Stack Decisions (ADRs)](#3-tech-stack-decisions-adrs)
4. [Project File Structure](#4-project-file-structure)
5. [Layer Architecture](#5-layer-architecture)
6. [Data Flow](#6-data-flow)
7. [Authentication Architecture](#7-authentication-architecture)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Performance Considerations](#9-performance-considerations)
10. [Scalability Path](#10-scalability-path)

---

## 1. System Overview

CIDMS is a **monorepo full-stack web application** consisting of:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend SPA** | React 18 + Vite + Tailwind CSS v3 | Admin UI |
| **REST API** | Node.js 20 + Express.js 4 | Business logic + data access |
| **Database** | MongoDB 7 + Mongoose 8 | Persistent data store |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Stateless authentication |

**Deployment topology:**

```
Browser → Vercel (React SPA) → Render/Railway (Express API) → MongoDB Atlas
```

**Communication pattern:** REST over HTTPS. Frontend makes authenticated API calls using `Authorization: Bearer <token>` header.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Admin)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React SPA (Vite + Tailwind)                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │    │
│  │  │  Pages   │  │Components│  │ Hooks    │  │ State  │  │    │
│  │  │ /login   │  │ Sidebar  │  │useAuth   │  │ Zustand│  │    │
│  │  │ /dash    │  │ Table    │  │useStudent│  │ /Context│  │    │
│  │  │ /students│  │ Modal    │  │useFees   │  │        │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │    │
│  │                     axios (API layer)                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS REST (JSON)
                               │ Authorization: Bearer <JWT>
┌──────────────────────────────▼──────────────────────────────────┐
│                    EXPRESS.JS SERVER (Render)                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Middleware Stack                                       │     │
│  │  helmet → cors → express.json → morgan → rateLimiter   │     │
│  └────────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Routes                                                 │     │
│  │  /api/auth  /api/students  /api/courses                 │     │
│  │  /api/batches  /api/payments  /api/dashboard            │     │
│  └────────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Controllers → Services → Models (Mongoose)            │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Mongoose ODM
┌──────────────────────────────▼──────────────────────────────────┐
│                    MONGODB ATLAS (Free Tier)                    │
│  Collections: admins, students, courses, batches, payments      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack Decisions (ADRs)

### ADR-001: React + Vite over Next.js

| Decision | Use React SPA with Vite, NOT Next.js |
|----------|--------------------------------------|
| **Context** | Admin-only dashboard, no SEO needed |
| **Reasons** | No SSR/SSG needed, simpler build, Vercel SPA deploy is trivial, faster HMR dev experience |
| **Trade-off** | Loses SSR performance benefits — acceptable since no public-facing pages |
| **Alternatives Rejected** | Next.js (overkill), Create React App (deprecated) |

### ADR-002: Express.js over Fastify/NestJS

| Decision | Use Express.js 4 |
|----------|-----------------|
| **Context** | Team familiarity, standard REST API, moderate scale |
| **Reasons** | Mature ecosystem, extensive middleware, simpler learning curve, enough for 500-student scale |
| **Trade-off** | Slightly less performant than Fastify at high load — irrelevant at this scale |
| **Alternatives Rejected** | Fastify (less familiar), NestJS (over-engineered for project scope) |

### ADR-003: MongoDB over PostgreSQL

| Decision | Use MongoDB Atlas with Mongoose |
|----------|--------------------------------|
| **Context** | Spec requirement, document-oriented schema fits coaching data |
| **Reasons** | Flexible schema for student profiles, free Atlas tier sufficient, ObjectId references work well |
| **Trade-off** | No joins — use Mongoose populate(); eventual consistency |
| **Alternatives Rejected** | PostgreSQL (spec says MongoDB), SQLite (no cloud support) |

### ADR-004: JWT (Stateless) over Sessions

| Decision | JWT tokens, 24h expiry, stored in localStorage |
|----------|------------------------------------------------|
| **Context** | Single admin, no multi-device logout needed |
| **Reasons** | No server-side session storage needed, stateless scales easily, simpler deployment |
| **Trade-off** | Cannot invalidate individual tokens before expiry (acceptable for single-admin use) |
| **Security note** | HttpOnly cookie is more secure; localStorage used here for simplicity. HttpOnly cookies recommended for v2.0 |

### ADR-005: Zustand for State Management

| Decision | Zustand over Redux / Context API |
|----------|----------------------------------|
| **Context** | Moderate complexity SPA |
| **Reasons** | Minimal boilerplate, works perfectly for auth state + UI state, tiny bundle |
| **Trade-off** | Less tooling than Redux DevTools — acceptable |

### ADR-006: Tailwind CSS v3 for Styling

| Decision | Tailwind CSS v3 utility-first |
|----------|---------------------------------|
| **Reasons** | Rapid dashboard development, consistent design tokens, no CSS-in-JS runtime cost |
| **UI Component Strategy** | Build custom components over a base (shadcn/ui or Flowbite React for tables/modals) |

---

## 4. Project File Structure

```
coaching-institute-dms/
│
├── 📁 frontend/                          # React SPA
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── 📁 api/                       # Axios API calls (per feature)
│   │   │   ├── auth.api.js
│   │   │   ├── students.api.js
│   │   │   ├── courses.api.js
│   │   │   ├── batches.api.js
│   │   │   ├── payments.api.js
│   │   │   └── dashboard.api.js
│   │   │
│   │   ├── 📁 components/                # Reusable UI components
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopBar.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   ├── 📁 common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── 📁 students/
│   │   │   │   ├── StudentTable.jsx
│   │   │   │   ├── StudentForm.jsx
│   │   │   │   └── StudentFilters.jsx
│   │   │   ├── 📁 courses/
│   │   │   │   ├── CourseTable.jsx
│   │   │   │   └── CourseForm.jsx
│   │   │   ├── 📁 batches/
│   │   │   │   ├── BatchTable.jsx
│   │   │   │   └── BatchForm.jsx
│   │   │   └── 📁 payments/
│   │   │       ├── PaymentTable.jsx
│   │   │       ├── PaymentForm.jsx
│   │   │       └── PendingFeesTable.jsx
│   │   │
│   │   ├── 📁 pages/                     # Route-level page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Batches.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── 📁 store/                     # Zustand state stores
│   │   │   ├── authStore.js
│   │   │   └── uiStore.js
│   │   │
│   │   ├── 📁 hooks/                     # Custom React hooks
│   │   │   ├── useDebounce.js
│   │   │   └── useLocalStorage.js
│   │   │
│   │   ├── 📁 utils/                     # Helper functions
│   │   │   ├── axios.config.js           # Axios instance + interceptors
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   └── exportHelpers.js          # CSV/Excel/PDF export logic
│   │   │
│   │   ├── 📁 routes/
│   │   │   └── ProtectedRoute.jsx        # JWT guard for routes
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── 📁 backend/                           # Express.js API
│   ├── 📁 config/
│   │   ├── db.js                         # MongoDB connection
│   │   └── env.js                        # Environment variable validation
│   │
│   ├── 📁 models/
│   │   ├── Admin.model.js
│   │   ├── Student.model.js
│   │   ├── Course.model.js
│   │   ├── Batch.model.js
│   │   └── Payment.model.js
│   │
│   ├── 📁 routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── course.routes.js
│   │   ├── batch.routes.js
│   │   ├── payment.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── 📁 controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── course.controller.js
│   │   ├── batch.controller.js
│   │   ├── payment.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── 📁 middleware/
│   │   ├── auth.middleware.js            # JWT verification
│   │   ├── validate.middleware.js        # Input validation (express-validator)
│   │   ├── errorHandler.middleware.js    # Central error handler
│   │   └── rateLimiter.middleware.js     # DDoS protection
│   │
│   ├── 📁 validators/
│   │   ├── auth.validator.js
│   │   ├── student.validator.js
│   │   ├── course.validator.js
│   │   ├── batch.validator.js
│   │   └── payment.validator.js
│   │
│   ├── 📁 utils/
│   │   ├── apiResponse.js                # Standardized API responses
│   │   └── asyncHandler.js               # Async error wrapper
│   │
│   ├── server.js                         # Entry point
│   ├── app.js                            # Express app setup
│   └── package.json
│
├── 📁 docs/                              # All documentation (this folder)
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE-SCHEMA.md
│   ├── API-DESIGN.md
│   ├── UI-UX-SPEC.md
│   ├── PROJECT-PLAN.md
│   ├── SECURITY.md
│   └── SETUP.md
│
├── coaching-institute-dms.md             # Master plan (task tracker)
├── CODEBASE.md                           # Project metadata
└── .gitignore
```

---

## 5. Layer Architecture

### Backend: Controller → Service Pattern

```
HTTP Request
     │
     ▼
[Route Handler]          # Maps URL to controller
     │
     ▼
[Validator Middleware]   # express-validator input sanitization
     │
     ▼
[Auth Middleware]        # JWT verify (protected routes)
     │
     ▼
[Controller]             # Orchestrates flow, sends response
     │
     ▼
[Mongoose Model]         # DB operations (direct for v1.0 CRUD)
     │
     ▼
[MongoDB]
```

> **Note:** A dedicated Service layer is recommended for v2.0 when business logic grows. At v1.0 CRUD scale, controllers calling models directly is simpler and sufficient.

### Frontend: Pages → Components → API

```
[React Router Route]
     │
     ▼
[Page Component]          # Manages page-level state, calls API hooks
     │
     ├──► [UI Components]  # Presentational (Table, Form, Modal)
     │
     └──► [API Module]     # axios calls to backend
               │
               ▼
         [axios instance]  # Base URL + interceptor for token injection
```

---

## 6. Data Flow

### Student Registration Flow

```
Admin fills form → StudentForm.jsx validates → POST /api/students
→ auth.middleware (JWT verify) → student.validator → student.controller
→ Student.model.create() → MongoDB insert
→ 201 response → React updates student list state → Toast "Student added"
```

### Fee Payment Flow

```
Admin records payment → PaymentForm.jsx → POST /api/payments
→ auth.middleware → payment.validator → payment.controller
→ Payment.model.create() → Student.model.findByIdAndUpdate(feePaid += amount)
→ 201 response → React refreshes student + payment data → Toast "Payment recorded"
```

### Dashboard Data Flow

```
Dashboard mounts → GET /api/dashboard/stats (single aggregation call)
→ controller runs MongoDB aggregations → returns counts + recent records
→ React renders StatCards + recent tables (no loading flicker due to single call)
```

---

## 7. Authentication Architecture

### Token Flow

```
POST /api/auth/login
  → Verify email exists in DB (Admin model)
  → bcrypt.compare(password, hash)
  → jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '24h' })
  → Response: { token, admin: { name, email } }

Frontend stores: localStorage.setItem('cidms_token', token)

All protected requests:
  → axios interceptor adds: Authorization: Bearer <token>
  → auth.middleware: jwt.verify(token, JWT_SECRET)
  → Attaches req.admin = decoded payload
  → Continues to controller
```

### Session Persistence

- Token persists in `localStorage` across browser refresh
- On app load, `authStore` reads `localStorage` and validates token expiry client-side
- Expired/invalid token → redirect to `/login`

### Password Reset (v1.0 Simplified)

- Admin seeds password on first run via `npm run seed:admin`
- No forgot-password email flow in v1.0 (acceptable for single-admin use)

---

## 8. Error Handling Strategy

### Backend: Centralized Error Handler

```javascript
// All async controllers wrapped in asyncHandler()
// Throws are caught centrally

// Error Response Shape:
{
  "success": false,
  "message": "Human-readable error",
  "errors": [] // Validation errors array (optional)
}
```

### HTTP Status Code Map

| Scenario | Status Code |
|----------|------------|
| Success (data returned) | 200 OK |
| Resource created | 201 Created |
| Bad input / validation | 400 Bad Request |
| Unauthenticated | 401 Unauthorized |
| Missing permissions | 403 Forbidden |
| Resource not found | 404 Not Found |
| Duplicate entry | 409 Conflict |
| Server error | 500 Internal Server Error |

### Frontend: axios Interceptors

```javascript
// Response interceptor:
// 401 → clear token, redirect to /login
// 500 → show generic error toast
// All errors → surface to component via error state
```

---

## 9. Performance Considerations

| Area | Strategy |
|------|---------|
| **Dashboard Stats** | Single MongoDB aggregation query (not N+1) |
| **Student List** | Server-side pagination (limit/skip) |
| **Search** | MongoDB text index on name + phone fields |
| **Photo uploads** | Cloudinary CDN (no binary in MongoDB) |
| **Frontend bundle** | Vite code splitting by route |
| **API caching** | No caching in v1.0 (sufficient for scale) |

---

## 10. Scalability Path

This v1.0 architecture supports **up to ~2,000 students** on free-tier infrastructure.

| Growth Stage | When | Action |
|-------------|------|--------|
| 500–2,000 students | Free tier | Add MongoDB indexes, optimize queries |
| 2,000–10,000 | Paid Atlas | Upgrade M10 cluster, add Redis caching |
| Multi-tenant (multiple institutes) | v3.0 | Add `instituteId` to all schemas |
| High availability | > 10k users | Containerize with Docker, K8s |

---

*Next: See [DATABASE-SCHEMA.md](./DATABASE-SCHEMA.md) for complete schema definitions.*
