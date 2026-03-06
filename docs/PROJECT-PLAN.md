# Project Plan & Development Milestones
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Author:** Project Planner + Orchestrator Agents  
> **Methodology:** Agile (2-week sprints), Feature-based phases  

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Agent Assignment Matrix](#2-agent-assignment-matrix)
3. [Phase Breakdown](#3-phase-breakdown)
4. [Sprint Plan](#4-sprint-plan)
5. [Task Dependency Graph](#5-task-dependency-graph)
6. [Definition of Done](#6-definition-of-done)
7. [Risk Register](#7-risk-register)
8. [Progress Tracker](#8-progress-tracker)

---

## 1. Project Overview

| Item | Value |
|------|-------|
| **Project Name** | Coaching Institute Data Management System |
| **Short Name** | CIDMS |
| **Total Phases** | 3 (MVP → Reports → Polish) |
| **Total Sprints** | 6 × 2-week sprints |
| **MVP Target** | Phase 1 complete (~4 weeks) |
| **Full v1.0 Target** | ~8-10 weeks |

### High-Level Milestones

```
Week 0 ──► [Documentation & Setup]
Week 2 ──► [Backend API: Auth + Students + Courses + Batches]
Week 4 ──► [Backend API: Payments + Dashboard | Frontend: Auth + Layout]
Week 6 ──► [Frontend: Students + Courses + Batches]
Week 8 ──► [Frontend: Payments + Dashboard Complete]
Week 10 ──► [Reports + Export + Polish + Deploy]
```

---

## 2. Agent Assignment Matrix

| Phase | Task Area | Assigned Agent | Skills Used |
|-------|-----------|---------------|-------------|
| 0 | Documentation | `product-manager` + `project-planner` | plan-writing, brainstorming |
| 1A | Project scaffold | `devops-engineer` | deployment-procedures |
| 1B | MongoDB schemas | `database-architect` | database-design |
| 1C | Backend API (Auth, CRUD) | `backend-specialist` | nodejs-best-practices, api-patterns |
| 1D | Auth middleware + Security | `security-auditor` | vulnerability-scanner |
| 2A | Frontend layout + routing | `frontend-specialist` | tailwind-patterns, frontend-design |
| 2B | Student/Course/Batch UI | `frontend-specialist` | nextjs-react-expert |
| 2C | Payment UI | `frontend-specialist` | frontend-design |
| 2D | Dashboard charts | `frontend-specialist` | tailwind-patterns |
| 3A | Export (CSV/Excel/PDF) | `backend-specialist` | nodejs-best-practices |
| 3B | E2E testing | `qa-automation-engineer` | webapp-testing, testing-patterns |
| 3C | Performance audit | `performance-optimizer` | performance-profiling |
| 3D | Deployment & CI/CD | `devops-engineer` | deployment-procedures |
| 3E | Security final audit | `security-auditor` | vulnerability-scanner, red-team-tactics |

---

## 3. Phase Breakdown

### PHASE 0: Foundation (Week 0–1)

> Goal: Project scaffold, docs, environment setup.

| # | Task | Owner | Verification |
|---|------|-------|-------------|
| 0.1 | Create all docs (PRD, Architecture, Schema, API, UI-UX) | Project Planner | All docs in `docs/` folder |
| 0.2 | Initialize monorepo structure | DevOps | Folders created, git init |
| 0.3 | Backend: `npm init`, install dependencies | Backend Specialist | `package.json` created |
| 0.4 | Frontend: `npm create vite@latest`, install Tailwind | Frontend Specialist | Dev server runs |
| 0.5 | MongoDB Atlas: Create cluster, get connection string | DevOps | DB connection test passes |
| 0.6 | Create `.env` file templates | Backend Specialist | `.env.example` committed |
| 0.7 | Git repository setup + `.gitignore` | DevOps | First commit pushed |

**Exit Criteria:** Both dev servers run, DB connects, docs all present.

---

### PHASE 1A: Backend — Models & Auth (Week 1–2)

> Goal: MongoDB models and authentication API working.

| # | Task | File | Verification |
|---|------|------|-------------|
| 1A.1 | Create `Admin.model.js` | `models/` | Schema exports correctly |
| 1A.2 | Create `Course.model.js` | `models/` | Schema exports correctly |
| 1A.3 | Create `Batch.model.js` | `models/` | Schema exports correctly |
| 1A.4 | Create `Student.model.js` (with virtuals + indexes) | `models/` | `remainingFees` virtual works |
| 1A.5 | Create `Payment.model.js` (with post-save hook) | `models/` | feesPaid updates on save |
| 1A.6 | Create `auth.controller.js` (login + me + change-pwd) | `controllers/` | POST /api/auth/login returns JWT |
| 1A.7 | Create `auth.middleware.js` (JWT verify) | `middleware/` | Protected routes reject invalid token |
| 1A.8 | Create `auth.routes.js` | `routes/` | Routes registered in app.js |
| 1A.9 | Create admin seed script | `scripts/` | `node seedAdmin.js` creates admin |
| 1A.10 | Setup `app.js` + `server.js` with middleware stack | root | Server starts on port 5000 |

**Exit Criteria:** 
- `POST /api/auth/login` returns a valid JWT
- `GET /api/auth/me` returns admin profile with valid token
- Invalid token returns 401

---

### PHASE 1B: Backend — Core CRUD APIs (Week 2–3)

> Goal: All CRUD endpoints for Students, Courses, Batches.

| # | Task | File | Verification |
|---|------|------|-------------|
| 1B.1 | Student CRUD controller | `controllers/student.controller.js` | All endpoints working |
| 1B.2 | Student routes | `routes/student.routes.js` | All routes registered |
| 1B.3 | Student validators (express-validator) | `validators/student.validator.js` | Validation rejects bad data |
| 1B.4 | Course CRUD controller | `controllers/course.controller.js` | Cannot delete if students enrolled |
| 1B.5 | Course routes + validators | `routes/` + `validators/` | |
| 1B.6 | Batch CRUD controller | `controllers/batch.controller.js` | |
| 1B.7 | Batch routes + validators | `routes/` + `validators/` | |
| 1B.8 | Pagination + search + filter logic | `controllers/student.controller.js` | Search returns filtered results |
| 1B.9 | Central error handler middleware | `middleware/errorHandler.middleware.js` | Errors return standard shape |
| 1B.10 | Rate limiter middleware | `middleware/rateLimiter.middleware.js` | 100 req/15min per IP |

**Exit Criteria:** All CRUD endpoints return expected data, validation works, errors are standardized.

---

### PHASE 1C: Backend — Payments & Dashboard API (Week 3–4)

> Goal: Payment recording + dashboard aggregations.

| # | Task | File | Verification |
|---|------|------|-------------|
| 1C.1 | Payment controller (create + list + pending) | `controllers/payment.controller.js` | POST creates payment + updates feesPaid |
| 1C.2 | Payment routes + validators | `routes/` + `validators/` | Amount > 0 validated |
| 1C.3 | Payment delete (reversal) | `controllers/payment.controller.js` | feesPaid decremented on delete |
| 1C.4 | Dashboard stats aggregation | `controllers/dashboard.controller.js` | Returns all 6 stats + recent lists |
| 1C.5 | Dashboard route | `routes/dashboard.routes.js` | |
| 1C.6 | Reports: CSV export | `controllers/` | Valid CSV downloaded |
| 1C.7 | Reports: Excel export (exceljs) | `controllers/` | Valid XLSX downloaded |
| 1C.8 | Reports: PDF export (pdfkit) | `controllers/` | Valid PDF downloaded |

**Exit Criteria:** Record payment updates student feesPaid. Dashboard returns correct aggregated stats.

---

### PHASE 2A: Frontend — Foundation & Auth (Week 4–5)

> Goal: Frontend running, auth flow complete.

| # | Task | File | Verification |
|---|------|------|-------------|
| 2A.1 | Setup Vite + React + Tailwind | `frontend/` | Dev server runs at localhost:5173 |
| 2A.2 | Install dependencies (zustand, react-router, axios, recharts) | `package.json` | No install errors |
| 2A.3 | Setup axios config with interceptors | `utils/axios.config.js` | 401 redirects to /login |
| 2A.4 | Zustand auth store | `store/authStore.js` | Token persists on refresh |
| 2A.5 | Login page UI | `pages/Login.jsx` | Looks correct, validates fields |
| 2A.6 | Login API integration | `api/auth.api.js` | Valid creds → dashboard redirect |
| 2A.7 | ProtectedRoute component | `routes/ProtectedRoute.jsx` | /dashboard redirects if no token |
| 2A.8 | Dashboard layout (Sidebar + TopBar) | `components/layout/` | Layout renders correctly |
| 2A.9 | React Router setup (all routes) | `App.jsx` | All page routes accessible |
| 2A.10 | Toast notification system | `components/common/Toast.jsx` | Success/error toasts appear |

**Exit Criteria:** Login works end-to-end. Protected routes block unauthenticated access. Layout renders.

---

### PHASE 2B: Frontend — Student, Course, Batch Pages (Week 5–6)

> Goal: Full CRUD UI for Students, Courses, Batches.

| # | Task | File | Verification |
|---|------|------|-------------|
| 2B.1 | Students page with table + pagination | `pages/Students.jsx` + `components/students/` | Lists students, paginates |
| 2B.2 | Student search + filters | `components/students/StudentFilters.jsx` | Filters work with debounce |
| 2B.3 | Add Student modal + form | `components/students/StudentForm.jsx` | Submits + creates student |
| 2B.4 | Edit Student modal | `components/students/StudentForm.jsx` | Pre-fills data, updates on save |
| 2B.5 | Delete student confirmation | `components/students/StudentTable.jsx` | Deletes with confirmation dialog |
| 2B.6 | Student profile page | `pages/StudentProfile.jsx` | Shows full details + payment history |
| 2B.7 | Courses page (table + CRUD modal) | `pages/Courses.jsx` | All course CRUD works |
| 2B.8 | Batches page (table + CRUD modal) | `pages/Batches.jsx` | All batch CRUD works |
| 2B.9 | Batch detail (students in batch) | `pages/Batches.jsx` | Click batch → see student list |
| 2B.10 | StatCard, Badge, Pagination components | `components/common/` | Renders correctly |

**Exit Criteria:** Admin can add, edit, delete, view students. Filter and search work. Courses and Batches fully functional.

---

### PHASE 2C: Frontend — Dashboard + Payments (Week 6–7)

> Goal: Dashboard with charts, full payments UI.

| # | Task | File | Verification |
|---|------|------|-------------|
| 2C.1 | Dashboard stats cards | `pages/Dashboard.jsx` | Shows correct totals from API |
| 2C.2 | Recent students table on dashboard | `pages/Dashboard.jsx` | Shows last 5 students |
| 2C.3 | Recent payments table on dashboard | `pages/Dashboard.jsx` | Shows last 5 payments |
| 2C.4 | Recharts: Revenue bar chart | `pages/Dashboard.jsx` | Monthly revenue chart renders |
| 2C.5 | Recharts: Enrollment trend chart | `pages/Dashboard.jsx` | Enrollment chart renders |
| 2C.6 | Payments page (history table) | `pages/Payments.jsx` | Lists all payments paginated |
| 2C.7 | Record Payment modal | `components/payments/PaymentForm.jsx` | Submits, updates student fees |
| 2C.8 | Pending Fees table | `components/payments/PendingFeesTable.jsx` | Lists all pending fees |
| 2C.9 | Quick "Pay" button on pending fees row | `components/payments/PendingFeesTable.jsx` | Opens payment modal pre-filled |

**Exit Criteria:** Dashboard shows live data. Payments can be recorded. Pending fees visible.

---

### PHASE 3: Reports, Polish & Deployment (Week 8–10)

> Goal: Export features, production-ready quality, deployed.

| # | Task | Owner | Verification |
|---|------|-------|-------------|
| 3.1 | Reports page UI (export buttons) | Frontend | Export buttons visible |
| 3.2 | CSV export integration | Frontend + Backend | CSV downloads correctly |
| 3.3 | Excel export integration | Frontend + Backend | XLSX downloads correctly |
| 3.4 | PDF export integration | Frontend + Backend | PDF downloads correctly |
| 3.5 | Loading skeletons on all tables | Frontend | No layout shift on load |
| 3.6 | Empty states on all pages | Frontend | "No students found" shown |
| 3.7 | Mobile/tablet responsive pass | Frontend | Works on 768px+ screens |
| 3.8 | Error boundary component | Frontend | App doesn't crash on errors |
| 3.9 | Security audit (OWASP Top 10) | Security Auditor | No critical vulnerabilities |
| 3.10 | Performance audit | Performance Optimizer | Dashboard loads < 2s |
| 3.11 | MongoDB Atlas production setup | DevOps | Connection string configured |
| 3.12 | Backend deploy to Render | DevOps | API accessible at render URL |
| 3.13 | Frontend deploy to Vercel | DevOps | SPA accessible at vercel URL |
| 3.14 | End-to-end smoke test on production | QA Engineer | Login → add student → record payment |

**Exit Criteria:** All exports work. Deployed and accessible. No critical security issues.

---

## 4. Sprint Plan

| Sprint | Duration | Goals | Phases |
|--------|---------|-------|--------|
| S0 | Week 0–1 | Docs + Project scaffold + DB setup | Phase 0 |
| S1 | Week 1–2 | Backend: Models + Auth API | Phase 1A |
| S2 | Week 2–3 | Backend: Student/Course/Batch CRUD | Phase 1B |
| S3 | Week 3–4 | Backend: Payments + Dashboard + Reports BE | Phase 1C |
| S4 | Week 4–6 | Frontend: Auth + Layout + Students + Courses + Batches | Phase 2A + 2B |
| S5 | Week 6–7 | Frontend: Dashboard + Payments | Phase 2C |
| S6 | Week 8–10 | Reports FE + Polish + Deploy + QA | Phase 3 |

---

## 5. Task Dependency Graph

```
Phase 0 (Docs + Scaffold)
    │
    ├──► Phase 1A (Models + Auth)
    │           │
    │           ├──► Phase 1B (CRUD APIs)
    │           │           │
    │           │           └──► Phase 1C (Payments + Dashboard)
    │           │                           │
    └──────────────────────────────────────►│
                                            │
                                    Phase 2A (Frontend Auth + Layout)
                                            │
                                    Phase 2B (Students + Courses + Batches FE)
                                            │
                                    Phase 2C (Dashboard + Payments FE)
                                            │
                                    Phase 3 (Reports + Polish + Deploy)
```

**Critical Path:**
`Scaffold → Models → Auth → CRUD APIs → Payments API → Frontend Auth → Students FE → Payments FE → Deploy`

---

## 6. Definition of Done

A task is DONE when:

- [ ] Code written and reviewed
- [ ] Feature works as described in acceptance criteria
- [ ] No TypeScript/lint errors
- [ ] API endpoint manually tested (Postman/Thunder Client)
- [ ] UI component renders correctly in desktop + tablet
- [ ] No console errors or warnings
- [ ] Committed to git with meaningful commit message

A phase is DONE when:
- [ ] All tasks in phase have "Done" status
- [ ] Phase exit criteria met
- [ ] No regressions in previously working features

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| MongoDB Atlas free tier limitations (512MB) | Low | Medium | Monitor storage; stay under 500 students for v1 |
| JWT stored in localStorage (XSS risk) | Medium | Medium | Migrate to HttpOnly cookies in v2; add Content Security Policy headers |
| Cloudinary free tier exhausted (photo uploads) | Low | Low | Store base64 in MongoDB as fallback or skip photos for v1 |
| Complex aggregation queries slow on free Atlas | Medium | Medium | Add indexes proactively; use lean() in Mongoose |
| Scope creep (student login requested mid-project) | High | High | Strictly enforce PRD "Out of Scope" section |
| exceljs / pdfkit bundle size | Low | Low | Dynamic import or server-side only |

---

## 8. Progress Tracker

> Update this section as development progresses.

### Phase Status

| Phase | Status | Completion | Notes |
|-------|--------|-----------|-------|
| Phase 0: Docs + Scaffold | ✅ Docs Created | 50% | Scaffold pending |
| Phase 1A: Models + Auth | 🔲 Not Started | 0% | |
| Phase 1B: CRUD APIs | 🔲 Not Started | 0% | |
| Phase 1C: Payments + Dashboard | 🔲 Not Started | 0% | |
| Phase 2A: Frontend Auth + Layout | 🔲 Not Started | 0% | |
| Phase 2B: Students + Courses + Batches FE | 🔲 Not Started | 0% | |
| Phase 2C: Dashboard + Payments FE | 🔲 Not Started | 0% | |
| Phase 3: Reports + Deploy | 🔲 Not Started | 0% | |

### Status Legend
- ✅ Complete
- 🔄 In Progress
- 🔲 Not Started
- ❌ Blocked

---

*Next: See [SECURITY.md](./SECURITY.md) for security requirements and deployment guide.*
