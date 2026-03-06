# CODEBASE.md — Project Metadata
# Coaching Institute Data Management System (CIDMS)

> This file is read by agents (project-planner, orchestrator) before taking any action.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | Coaching Institute Data Management System |
| **Short Name** | CIDMS |
| **Type** | WEB (Full-Stack Admin Dashboard) |
| **Version** | 1.0.0 (in development) |
| **OS** | Windows (PowerShell) |
| **Started** | March 6, 2026 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS v3 |
| **State** | Zustand |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Backend** | Node.js 20 + Express.js 4 |
| **Database** | MongoDB 7 + Mongoose 8 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Validation** | express-validator |
| **Security** | helmet, cors, express-rate-limit |
| **Export** | exceljs, pdfkit, csv-stringify |

---

## Repository Structure

```
coaching-institute-dms/
├── frontend/          # React SPA (Vite)
├── backend/           # Node.js + Express API
├── docs/              # All documentation
├── CODEBASE.md        # This file
└── coaching-institute-dms.md  # Master task plan
```

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [docs/PRD.md](docs/PRD.md) | Product Requirements + User Stories |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical Architecture + ADRs |
| [docs/DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) | MongoDB schemas + Mongoose models |
| [docs/API-DESIGN.md](docs/API-DESIGN.md) | All REST endpoints + examples |
| [docs/UI-UX-SPEC.md](docs/UI-UX-SPEC.md) | Design system + wireframes |
| [docs/PROJECT-PLAN.md](docs/PROJECT-PLAN.md) | Sprint plan + task breakdown |
| [docs/SECURITY.md](docs/SECURITY.md) | Security checklist + deployment guide |
| [docs/SETUP.md](docs/SETUP.md) | Developer setup + troubleshooting |

---

## Deployment Targets

| Component | Platform | URL Pattern |
|-----------|---------|-------------|
| Frontend | Vercel | `https://cidms.vercel.app` |
| Backend | Render | `https://cidms-api.onrender.com` |
| Database | MongoDB Atlas | Free M0 cluster |

---

## Current Phase

**Phase 0: Documentation Complete** ✅  
**Next: Phase 1A — Backend Models + Auth**

See [coaching-institute-dms.md](coaching-institute-dms.md) for active task tracking.

---

## Agent Instructions

- **OS is Windows** → Use PowerShell syntax, not bash
- **Do NOT change tech stack** without updating this file
- **Do NOT add new features** beyond PRD scope without user confirmation
- **All plans** → `coaching-institute-dms.md` in project root
- **All code** → Must pass `npm audit` before deployment
