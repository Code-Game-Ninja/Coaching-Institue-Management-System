# Product Requirements Document (PRD)
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Author:** Product Manager Agent  
> **Status:** Approved — Ready for Development  

---

## 📑 Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Target Audience & Personas](#2-target-audience--personas)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Feature Breakdown (MoSCoW)](#4-feature-breakdown-moscow)
5. [User Stories](#5-user-stories)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Out of Scope (v1.0)](#7-out-of-scope-v10)
8. [Constraints & Assumptions](#8-constraints--assumptions)

---

## 1. Problem Statement

Small-to-medium coaching institutes currently manage student data, fee records, and batch scheduling through fragmented tools — spreadsheets, paper registers, and disconnected apps. This causes:

- **Data loss risk** from manual entry errors and untracked payments
- **No real-time visibility** into pending fees or batch status
- **Slow admin operations** — finding a student record takes minutes
- **Zero audit trail** for payments and enrollment changes
- **No single source of truth** across courses, batches, and students

**Solution:** A centralized, secure, web-based Admin Dashboard that gives coaching institute administrators complete control over students, courses, batches, fees, and reporting — accessible from desktop or tablet.

---

## 2. Target Audience & Personas

### Primary Persona: Institute Administrator (Ravi, 35)

| Attribute | Detail |
|-----------|--------|
| **Role** | Owner / Admin of a coaching institute |
| **Tech Comfort** | Moderate — uses Google Sheets, WhatsApp |
| **Pain Point** | Spends 2+ hours/day on manual fee tracking |
| **Goal** | Single dashboard to manage 200–500 students |
| **Device** | Desktop (primary), tablet (secondary) |
| **Key Need** | Quick fee tracking, overdue alerts, easy enrollment |

### Secondary Persona: Reception Staff (Priya, 28)

| Attribute | Detail |
|-----------|--------|
| **Role** | Receptionist / Data Entry Operator |
| **Pain Point** | No system to quickly add/search students |
| **Goal** | Add new students, record payments in under 2 minutes |
| **Device** | Desktop |

> **Note:** No student-facing login is required in v1.0.

---

## 3. Goals & Success Metrics

### Business Goals

| Goal | Metric | Target |
|------|--------|--------|
| Reduce fee tracking time | Time spent on fee management | < 30 min/day (from 2+ hrs) |
| Eliminate data errors | Manual entry error rate | < 1% |
| Improve visibility | Time to find student info | < 10 seconds |
| Audit compliance | Payment audit trail | 100% recorded |

### Technical Goals

- System handles **500+ students** without performance degradation
- Dashboard loads in **< 2 seconds** on average connection
- API response time **< 300ms** for standard queries
- **99.5% uptime** on cloud deployment

---

## 4. Feature Breakdown (MoSCoW)

### MUST HAVE (MVP — Phase 1)

| # | Feature | Reason |
|---|---------|--------|
| M1 | Admin Authentication (JWT + bcrypt) | Security requirement |
| M2 | Student Add / Edit / Delete / View | Core function |
| M3 | Course Create / Edit / Delete | Dependency for students |
| M4 | Batch Create / Edit / Delete | Dependency for students |
| M5 | Fee Payment Recording | Core business value |
| M6 | Pending Fees Tracking | Core business value |
| M7 | Dashboard Summary Cards | Visibility |
| M8 | Student Search & Filters | Operational need |
| M9 | Protected Routes + Logout | Security |

### SHOULD HAVE (Phase 2)

| # | Feature | Reason |
|---|---------|--------|
| S1 | Export CSV / Excel for student list | Reporting |
| S2 | Export PDF fees report | Accounting |
| S3 | Payment history view | Audit trail |
| S4 | Dashboard charts (revenue, enrollment) | Management |
| S5 | Student photo upload | Profile completeness |
| S6 | Pagination on all tables | Performance |

### COULD HAVE (Phase 3)

| # | Feature | Reason |
|---|---------|--------|
| C1 | Email notification on fee overdue | Automation |
| C2 | Dark mode toggle | UX polish |
| C3 | Bulk import students (CSV) | Efficiency |
| C4 | SMS integration for payment reminders | High value add |
| C5 | Multi-admin support (role-based) | Scale |

### WON'T HAVE (v1.0 — Explicitly Out of Scope)

- Student login portal
- Online payment gateway integration
- Mobile app (iOS/Android)
- Advanced analytics / BI dashboards
- Parent portal
- Attendance management

---

## 5. User Stories

### Authentication

| ID | Story | Priority |
|----|-------|----------|
| US-A01 | As an admin, I want to log in with email and password so that I can securely access the dashboard. | P0 |
| US-A02 | As an admin, I want my session to persist for 24 hours so that I don't have to log in repeatedly. | P0 |
| US-A03 | As an admin, I want to log out securely so that my data is safe when I'm away. | P0 |
| US-A04 | As an admin, I want the login form to show clear error messages so that I know why my login failed. | P1 |

### Dashboard

| ID | Story | Priority |
|----|-------|----------|
| US-D01 | As an admin, I want to see total students, courses, revenue, and pending fees on the dashboard so that I have an overview at a glance. | P0 |
| US-D02 | As an admin, I want to see recent student registrations on the dashboard so that I know today's activity. | P1 |
| US-D03 | As an admin, I want to see recent payments on the dashboard so that I can confirm payment entries quickly. | P1 |
| US-D04 | As an admin, I want visual charts for revenue and enrollment trends so that I can track growth. | P2 |

### Student Management

| ID | Story | Priority |
|----|-------|----------|
| US-S01 | As an admin, I want to add a student with all required fields so that their record is complete. | P0 |
| US-S02 | As an admin, I want to edit a student's details so that I can correct errors or update information. | P0 |
| US-S03 | As an admin, I want to delete a student with a confirmation prompt so that I don't accidentally remove records. | P0 |
| US-S04 | As an admin, I want to view a full student profile so that I can see all their details in one place. | P0 |
| US-S05 | As an admin, I want to search students by name or phone so that I can find a record quickly. | P0 |
| US-S06 | As an admin, I want to filter students by course, batch, or pending fees so that I can segment the list. | P1 |
| US-S07 | As an admin, I want to upload a student photo so that the profile is complete. | P2 |

### Course Management

| ID | Story | Priority |
|----|-------|----------|
| US-C01 | As an admin, I want to create a course with name, duration, fees, and description so that I can enroll students. | P0 |
| US-C02 | As an admin, I want to edit course details so that I can update pricing or description. | P0 |
| US-C03 | As an admin, I want to delete a course (with guard if students are enrolled) so that I don't break existing records. | P0 |

### Batch Management

| ID | Story | Priority |
|----|-------|----------|
| US-B01 | As an admin, I want to create a batch linked to a course so that I can group students. | P0 |
| US-B02 | As an admin, I want to assign students to a batch so that they are grouped correctly. | P0 |
| US-B03 | As an admin, I want to view all students in a batch so that I know the batch size and composition. | P1 |
| US-B04 | As an admin, I want to set batch timing, teacher, and start/end dates so that scheduling is clear. | P1 |

### Fee Management

| ID | Story | Priority |
|----|-------|----------|
| US-F01 | As an admin, I want to record a fee payment for a student so that their ledger is updated. | P0 |
| US-F02 | As an admin, I want the system to automatically calculate remaining fees so that I don't need manual arithmetic. | P0 |
| US-F03 | As an admin, I want to view the full payment history for a student so that I have an audit trail. | P0 |
| US-F04 | As an admin, I want to track all students with pending fees so that I can follow up. | P0 |
| US-F05 | As an admin, I want to record payment mode (Cash/UPI/Bank Transfer) so that accounting is accurate. | P0 |

### Reports & Export

| ID | Story | Priority |
|----|-------|----------|
| US-R01 | As an admin, I want to export the student list to CSV so that I can share it with others. | P1 |
| US-R02 | As an admin, I want to export the fees report to PDF so that I can use it for accounting. | P1 |
| US-R03 | As an admin, I want to export payment history to Excel so that I can analyze it offline. | P1 |

---

## 6. Acceptance Criteria

### AC-A01: Admin Login

```gherkin
Given the admin is on the login page
When they enter a valid email and password
Then they are redirected to the dashboard
And a JWT token is stored in localStorage

Given the admin enters an invalid password
When they submit the form
Then an error message "Invalid credentials" is displayed
And no token is stored

Given the admin is on a protected route without a token
When the page loads
Then they are redirected to /login
```

### AC-S01: Add Student

```gherkin
Given the admin is on the Students page
When they click "Add Student" and fill in Name, Phone, Email, Course, Batch, Total Fees
Then a new student record is created in the database
And the student appears in the table immediately

Given the admin submits with missing required fields (Name or Phone)
Then inline validation errors appear
And the form is NOT submitted
```

### AC-F01: Record Payment

```gherkin
Given a student with Total Fees = 10,000 and Fees Paid = 4,000
When the admin records a payment of 2,000
Then Fees Paid becomes 6,000
And Remaining Fees becomes 4,000
And a payment record is created with date, mode, and amount

Given the admin tries to record a payment greater than remaining fees
Then a warning is shown: "Payment exceeds remaining balance"
```

### AC-F04: Pending Fees Tracking

```gherkin
Given there are students with remaining fees > 0
When the admin opens the Fees Management page
Then all students with pending fees are listed
With their name, course, batch, and remaining amount visible

Given all fees are paid
Then the student is marked as "Cleared" with a green badge
```

### AC-D01: Dashboard Load

```gherkin
Given the admin is authenticated
When they navigate to the dashboard
Then the page loads in under 2 seconds
And shows: total students, total courses, total revenue, total pending fees
And recent 5 student registrations
And recent 5 payments
```

---

## 7. Out of Scope (v1.0)

The following are explicitly **NOT** part of this release:

| Item | Reason |
|------|--------|
| Student login portal | v2.0 feature |
| Online payment gateway (Razorpay, Stripe) | High complexity, separate project |
| Mobile native app | v3.0 |
| Attendance tracking | Out of scope per brief |
| Email/SMS notifications | Phase 3 |
| Multi-tenant (multiple institutes) | Architecture change needed |
| Advanced BI / analytics | Separate tooling recommended |

---

## 8. Constraints & Assumptions

### Constraints

| Type | Constraint |
|------|-----------|
| **Tech** | Must use React, Node.js, MongoDB, JWT, bcrypt as specified |
| **Deployment** | Frontend → Vercel, Backend → Render/Railway, DB → MongoDB Atlas |
| **Auth** | Single admin account (no multi-user in v1.0) |
| **Budget** | Free tier hosting assumed for initial deployment |

### Assumptions

1. The institute has one admin (or a small team using one shared admin account).
2. MongoDB Atlas free tier (512MB) is sufficient for < 1,000 student records.
3. File uploads (photos) will use Cloudinary free tier or base64 storage.
4. The admin has a reliable internet connection.
5. Browser target: Chrome/Edge (latest 2 versions), Firefox, Safari.

---

*Next: See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical design decisions.*
