# coaching-institute-dms.md
## Master Task Plan — CIDMS

> **Task:** Build full-stack Coaching Institute Data Management System  
> **Type:** WEB — Admin Dashboard Only  
> **Created:** March 6, 2026  
> **Stack:** React + Tailwind | Node.js + Express | MongoDB | JWT + bcrypt  

---

## ✅ Phase 0: Documentation & Foundation

- [x] PRD.md — Product requirements, user stories, acceptance criteria
- [x] ARCHITECTURE.md — Tech stack decisions, ADRs, file structure diagram
- [x] DATABASE-SCHEMA.md — All 5 Mongoose schemas with full code
- [x] API-DESIGN.md — All REST endpoints with request/response examples
- [x] UI-UX-SPEC.md — Design tokens, component library, wireframes
- [x] PROJECT-PLAN.md — Sprint plan, task breakdown, agent assignments
- [x] SECURITY.md — OWASP checklist, deployment guide, env vars
- [x] SETUP.md — Local development setup, dependencies, troubleshooting
- [x] CODEBASE.md — Project metadata for agents
- [x] Initialize backend project (npm init, install deps)
- [x] Initialize frontend project (Vite + Tailwind setup)
- [ ] MongoDB Atlas cluster created
- [x] .gitignore + git init

---

## ✅ Phase 1A: Backend — Models & Auth

- [x] `backend/config/db.js` — MongoDB connection
- [x] `backend/models/Admin.model.js`
- [x] `backend/models/Course.model.js`
- [x] `backend/models/Batch.model.js`
- [x] `backend/models/Student.model.js` (with virtuals + text indexes)
- [x] `backend/models/Payment.model.js` (with post-save hook)
- [x] `backend/middleware/auth.middleware.js` — JWT verify
- [x] `backend/middleware/errorHandler.middleware.js`
- [x] `backend/middleware/rateLimiter.middleware.js`
- [x] `backend/utils/asyncHandler.js`
- [x] `backend/utils/apiResponse.js`
- [x] `backend/controllers/auth.controller.js` (login, me, change-password)
- [x] `backend/routes/auth.routes.js`
- [x] `backend/app.js` + `backend/server.js`
- [x] `backend/scripts/seedAdmin.js`
- [ ] **VERIFY:** POST /api/auth/login returns JWT ✓

---

## ✅ Phase 1B: Backend — CRUD APIs

- [x] `backend/validators/student.validator.js`
- [x] `backend/controllers/student.controller.js` (CRUD + search + filter + pagination)
- [x] `backend/routes/student.routes.js`
- [x] `backend/validators/course.validator.js`
- [x] `backend/controllers/course.controller.js` (CRUD + guard on delete)
- [x] `backend/routes/course.routes.js`
- [x] `backend/validators/batch.validator.js`
- [x] `backend/controllers/batch.controller.js` (CRUD + students-in-batch)
- [x] `backend/routes/batch.routes.js`
- [ ] **VERIFY:** Student CRUD with pagination, search, filters ✓
- [ ] **VERIFY:** Cannot delete Course with enrolled students ✓

---

## ✅ Phase 1C: Backend — Payments + Dashboard + Exports

- [x] `backend/validators/payment.validator.js`
- [x] `backend/controllers/payment.controller.js` (create, list, pending, delete)
- [x] `backend/routes/payment.routes.js`
- [x] `backend/controllers/dashboard.controller.js` (aggregation stats)
- [x] `backend/routes/dashboard.routes.js`
- [x] `backend/controllers/report.controller.js` (CSV, Excel, PDF exports)
- [x] `backend/routes/report.routes.js`
- [ ] **VERIFY:** Record payment → updates student feesPaid ✓
- [ ] **VERIFY:** Dashboard returns aggregated stats in < 300ms ✓
- [ ] **VERIFY:** CSV/Excel/PDF downloads correctly ✓

---

## ✅ Phase 2A: Frontend — Auth + Layout

- [x] Vite + React + Tailwind configured
- [x] All dependencies installed (zustand, react-router, axios, recharts, lucide-react)
- [x] `src/utils/axios.config.js` — axios instance + interceptors
- [x] `src/store/authStore.js` — Zustand auth store
- [x] `src/routes/ProtectedRoute.jsx`
- [x] `src/App.jsx` — React Router setup (all routes)
- [x] `src/pages/Login.jsx` — Login page UI + API integration
- [x] `src/components/layout/Sidebar.jsx`
- [x] `src/components/layout/TopBar.jsx`
- [x] `src/components/layout/DashboardLayout.jsx`
- [x] `src/components/common/Toast.jsx` (react-hot-toast integration)
- [ ] **VERIFY:** Login works end-to-end ✓
- [ ] **VERIFY:** /dashboard redirects to /login if no token ✓

---

## ✅ Phase 2B: Frontend — Students + Courses + Batches

- [x] `src/components/common/` — Button, Input, Modal, Table, Pagination, Badge, StatCard, SearchBar, LoadingSpinner
- [x] `src/api/students.api.js` + `src/api/courses.api.js` + `src/api/batches.api.js`
- [x] `src/pages/Students.jsx` — Students list + search + filters
- [x] `src/components/students/StudentTable.jsx` (inlined in Students.jsx)
- [x] `src/components/students/StudentForm.jsx` (inlined in Students.jsx)
- [x] `src/components/students/StudentFilters.jsx` (inlined in Students.jsx)
- [x] `src/pages/StudentProfile.jsx` — Full profile + payment history
- [x] `src/pages/Courses.jsx` — Courses CRUD
- [x] `src/components/courses/CourseForm.jsx` + `CourseTable.jsx` (inlined in Courses.jsx)
- [x] `src/pages/Batches.jsx` — Batches CRUD + students-in-batch view
- [x] `src/components/batches/BatchForm.jsx` + `BatchTable.jsx` (inlined in Batches.jsx)
- [ ] **VERIFY:** Student add/edit/delete/view all work ✓
- [ ] **VERIFY:** Course and Batch CRUD work ✓

---

## ✅ Phase 2C: Frontend — Dashboard + Payments

- [x] `src/api/dashboard.api.js` + `src/api/payments.api.js`
- [x] `src/pages/Dashboard.jsx` — Stats cards + recent tables + charts
- [x] `src/pages/Payments.jsx` — Payment history + pending fees
- [x] `src/components/payments/PaymentForm.jsx` (inlined in Payments.jsx)
- [x] `src/components/payments/PendingFeesTable.jsx` (inlined in Payments.jsx)
- [x] `src/components/payments/PaymentTable.jsx` (inlined in Payments.jsx)
- [x] Recharts: Revenue bar chart + Enrollment line chart
- [ ] **VERIFY:** Dashboard shows live data ✓
- [ ] **VERIFY:** Record payment → student remaining fees updates ✓

---

## ✅ Phase 3: Reports + Polish (Partial — Deploy Pending)

- [x] `src/pages/Reports.jsx` — Export buttons
- [x] `src/utils/exportHelpers.js` — download via blob in reports.api.js
- [x] Loading skeleton components for all tables (LoadingSpinner)
- [x] Empty state components for all pages (EmptyState)
- [ ] Mobile/tablet responsive check (768px+)
- [ ] Error boundary component
- [ ] `npm audit` — no critical vulnerabilities
- [ ] Performance audit — Dashboard < 2s
- [ ] MongoDB Atlas production cluster setup
- [ ] Backend deployed to Render + env vars set
- [ ] Frontend deployed to Vercel + env vars set
- [ ] `vercel.json` with SPA rewrite rules
- [ ] **FINAL VERIFY:** Login → Add Student → Record Payment → Export on production ✓

---

## Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | React + Vite | SPA, no SSR needed, faster dev |
| State | Zustand | Minimal boilerplate |
| API pattern | REST | Standard, well-understood |
| Auth | JWT (localStorage) | Simple single-admin setup |
| Password hashing | bcrypt saltRounds=12 | Security + UX balance |
| Charts | Recharts | Best React chart library |
| Icons | lucide-react | Lightweight, consistent |
| Export: Excel | exceljs (server-side) | Better formatting control |
| Export: PDF | pdfkit (server-side) | Full control over layout |
| Export: CSV | csv-stringify (server-side) | Reliable escaping |

---

## Out of Scope (DO NOT ADD)

- Student login portal
- Online payment gateway
- Mobile app  
- Email/SMS notifications
- Attendance tracking
- Multi-tenant support
- Dark mode

---

*Reference: See `docs/` folder for all supporting documents.*
