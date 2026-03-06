# Developer Setup Guide
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **OS:** Windows (PowerShell) / macOS / Linux  
> **Node.js Required:** v20 LTS or higher  

---

## 📑 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Repository Setup](#2-repository-setup)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [Database Setup](#5-database-setup)
6. [Running Development Servers](#6-running-development-servers)
7. [Backend Dependencies Reference](#7-backend-dependencies-reference)
8. [Frontend Dependencies Reference](#8-frontend-dependencies-reference)
9. [Useful Scripts](#9-useful-scripts)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | v20 LTS+ | [nodejs.org](https://nodejs.org) |
| npm | v10+ | Bundled with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| MongoDB | Atlas (cloud) OR v7 local | See Section 5 |
| VS Code | Latest | Recommended IDE |
| Thunder Client / Postman | Any | For API testing |

### Verify Installation

```powershell
node --version   # Should be v20.x.x
npm --version    # Should be 10.x.x
git --version    # Should be 2.x.x
```

---

## 2. Repository Setup

```powershell
# Clone the repository (once created)
git clone https://github.com/your-org/cidms.git
cd cidms

# Project structure created:
# coaching-institute-dms/
#   ├── frontend/
#   ├── backend/
#   └── docs/
```

If starting from scratch (scaffold):

```powershell
# Create project folders
mkdir coaching-institute-dms
cd coaching-institute-dms
mkdir backend, frontend, docs
git init
```

---

## 3. Backend Setup

### Step 1: Initialize Backend

```powershell
cd backend
npm init -y
```

### Step 2: Install Dependencies

```powershell
# Production dependencies
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan express-rate-limit express-validator dotenv

# Export libraries
npm install exceljs pdfkit csv-stringify

# Development dependencies
npm install --save-dev nodemon
```

### Step 3: Configure package.json Scripts

Add to `backend/package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed:admin": "node scripts/seedAdmin.js"
  }
}
```

### Step 4: Create Environment File

```powershell
# In backend/ folder:
Copy-Item .env.example .env
# Then edit .env with your values
```

`backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/cidms
JWT_SECRET=your-super-secret-jwt-key-minimum-64-characters-long-change-this
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

### Step 5: Create Server Files

Create `backend/server.js`:
```javascript
import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
```

Create `backend/app.js`:
```javascript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import courseRoutes from './routes/course.routes.js';
import batchRoutes from './routes/batch.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiter (global)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler
app.use(errorHandler);

export default app;
```

Create `backend/config/db.js`:
```javascript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};
```

Create `backend/utils/asyncHandler.js`:
```javascript
// Wraps async route handlers to catch errors
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

Create `backend/utils/apiResponse.js`:
```javascript
export const successResponse = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const errorResponse = (res, message, status = 500, errors = []) =>
  res.status(status).json({ success: false, message, errors });
```

Create `backend/middleware/errorHandler.middleware.js`:
```javascript
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
};
```

Create `backend/middleware/auth.middleware.js`:
```javascript
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const admin = await Admin.findById(decoded.id).select('-password');
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Admin not found. Token invalid.',
    });
  }

  req.admin = admin;
  next();
});
```

### Step 6: Seed Admin

```powershell
node scripts/seedAdmin.js
# Output: ✅ Admin seeded: admin@institute.com / Admin@123
# ⚠️  CHANGE PASSWORD IMMEDIATELY after first login!
```

---

## 4. Frontend Setup

### Step 1: Create Vite React Project

```powershell
cd .. # Back to project root
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Step 2: Install Tailwind CSS

```powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Step 3: Install Frontend Dependencies

```powershell
npm install axios zustand react-router-dom recharts react-hot-toast

# Export utilities
npm install xlsx jspdf jspdf-autotable

# Icons
npm install lucide-react
```

### Step 4: Create Frontend Environment File

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Database Setup

### Option A: MongoDB Atlas (Cloud — Recommended)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Create database user with `readWrite` on `cidms` db
4. Allow network access (your IP or 0.0.0.0/0 for dev)
5. Copy connection string → paste in backend `.env` as `MONGO_URI`

### Option B: Local MongoDB

```powershell
# Install MongoDB Community: https://www.mongodb.com/try/download/community
# Or via Chocolatey (Windows):
choco install mongodb

# Start MongoDB service:
net start MongoDB

# Your MONGO_URI:
MONGO_URI=mongodb://localhost:27017/cidms
```

**Verify connection:**
```powershell
cd backend
node -e "import('./config/db.js').then(m => m.connectDB())"
# Should print: ✅ MongoDB connected: localhost
```

---

## 6. Running Development Servers

### Terminal 1 — Backend

```powershell
cd backend
npm run dev
# Output: 🚀 Server running on http://localhost:5000
#         ✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm run dev
# Output: VITE v5.x.x  ready in 300ms
#         ➜  Local:   http://localhost:5173/
```

### Access the App

1. Open browser → `http://localhost:5173`
2. Login: `admin@institute.com` / `Admin@123`
3. **Change password immediately!**

---

## 7. Backend Dependencies Reference

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18 | HTTP server framework |
| `mongoose` | ^8.0 | MongoDB ODM |
| `bcryptjs` | ^2.4 | Password hashing |
| `jsonwebtoken` | ^9.0 | JWT generation/verification |
| `cors` | ^2.8 | Cross-origin resource sharing |
| `helmet` | ^7.0 | Security HTTP headers |
| `morgan` | ^1.10 | HTTP request logging |
| `express-rate-limit` | ^7.0 | Rate limiting |
| `express-validator` | ^7.0 | Input validation + sanitization |
| `dotenv` | ^16.0 | Environment variable loading |
| `exceljs` | ^4.3 | Excel (XLSX) file generation |
| `pdfkit` | ^0.13 | PDF generation |
| `csv-stringify` | ^6.4 | CSV generation |
| `nodemon` | ^3.0 | Dev: auto-restart on file change |

---

## 8. Frontend Dependencies Reference

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.0 | UI library |
| `react-dom` | ^18.0 | React DOM renderer |
| `react-router-dom` | ^6.0 | Client-side routing |
| `axios` | ^1.6 | HTTP client |
| `zustand` | ^4.4 | State management |
| `recharts` | ^2.9 | Charts (Revenue, Enrollment) |
| `react-hot-toast` | ^2.4 | Toast notifications |
| `lucide-react` | ^0.300 | Icon library |
| `xlsx` | ^0.18 | Client-side Excel export |
| `jspdf` | ^2.5 | Client-side PDF generation |
| `jspdf-autotable` | ^3.8 | PDF tables |
| `tailwindcss` | ^3.4 | CSS framework |
| `vite` | ^5.0 | Build tool + dev server |

---

## 9. Useful Scripts

### Backend

```powershell
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Seed admin account
npm run seed:admin

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

### Frontend

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint check
npm run lint
```

---

## 10. Troubleshooting

### MongoDB connection fails

```
Error: MongoServerError: bad auth
```
**Fix:** Double-check username and password in `MONGO_URI`. Ensure user exists in Atlas.

---

```
Error: MongoNetworkError: connection refused
```
**Fix (Atlas):** Whitelist your IP at Atlas → Network Access → Add IP Address  
**Fix (Local):** Run `net start MongoDB` (Windows) or `mongod` (Mac/Linux)

---

### JWT errors

```
JsonWebTokenError: invalid signature
```
**Fix:** `JWT_SECRET` mismatch between token generation and verification. Restart backend after changing `.env`.

---

### CORS errors in browser

```
Access to XMLHttpRequest at 'http://localhost:5000' has been blocked by CORS policy
```
**Fix:** Ensure `FRONTEND_URL=http://localhost:5173` in `backend/.env`. Restart backend.

---

### Vite env variable not working

```
import.meta.env.VITE_API_URL is undefined
```
**Fix:** Env variables must start with `VITE_`. Restart Vite dev server after changing `.env`.

---

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::5000
```

```powershell
# Windows: Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

### Nodemon not found

```
nodemon: command not found
```

```powershell
npm install -D nodemon
# Then use: npx nodemon server.js
# Or: npm run dev (configured in package.json)
```

---

*You are now ready to build CIDMS. Start with Phase 1A: Backend Models + Auth.*  
*See [PROJECT-PLAN.md](./PROJECT-PLAN.md) for the full task breakdown.*
