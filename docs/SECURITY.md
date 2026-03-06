# Security & Deployment Guide
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Authors:** Security Auditor Agent + DevOps Engineer Agent  

---

## 📑 Table of Contents

1. [Security Architecture](#1-security-architecture)
2. [OWASP Top 10 Checklist](#2-owasp-top-10-checklist)
3. [Authentication Security](#3-authentication-security)
4. [Input Validation & Sanitization](#4-input-validation--sanitization)
5. [API Security Headers](#5-api-security-headers)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Deployment: MongoDB Atlas](#7-deployment-mongodb-atlas)
8. [Deployment: Backend → Render](#8-deployment-backend--render)
9. [Deployment: Frontend → Vercel](#9-deployment-frontend--vercel)
10. [Post-Deployment Checklist](#10-post-deployment-checklist)
11. [Incident Response](#11-incident-response)

---

## 1. Security Architecture

```
Internet
   │
   ▼
[Vercel CDN Edge]           → HTTPS enforced, automatic SSL cert
   │
[React SPA]                 → No secrets in frontend code
   │
   ▼ HTTP/S + JWT Bearer
[Render API Server]
   │
   ├─ Helmet.js             → Security headers (XSS, CSRF, Clickjacking)
   ├─ CORS (whitelist only) → Only allow known frontend origin
   ├─ Rate Limiter           → 100 req/15min per IP
   ├─ express-validator     → Input sanitization + validation
   ├─ auth.middleware.js    → JWT verification on all protected routes
   └─ MongoDB Driver         → Connection string never exposed
         │
         ▼
[MongoDB Atlas]             → IP whitelist, TLS-encrypted connection
```

---

## 2. OWASP Top 10 Checklist

### A01 — Broken Access Control ✅

| Check | Implementation |
|-------|---------------|
| All admin routes behind JWT middleware | `auth.middleware.js` on every protected route |
| No student can access admin data | Single-role system, no student logins |
| Admin can only access their own data | Single-admin setup, no cross-tenant data |
| Horizontal privilege escalation impossible | ObjectId validation prevents guessing other IDs |

```javascript
// EVERY protected route uses:
router.use(verifyToken); // Applied at router level, not per-route
```

---

### A02 — Cryptographic Failures ✅

| Check | Implementation |
|-------|---------------|
| Passwords hashed, never plaintext | bcryptjs with saltRounds=12 |
| JWT secret is strong and rotatable | From env var, minimum 64 chars |
| HTTPS enforced in production | Vercel + Render both enforce HTTPS |
| MongoDB connection uses TLS | MongoDB Atlas default (TLS 1.2+) |
| No sensitive data in frontend code | Secrets only in backend `.env` |
| No sensitive data in error messages | Generic errors returned to client |

```javascript
// bcrypt usage:
const SALT_ROUNDS = 12; // Not 10 — extra security
const hash = await bcrypt.hash(password, SALT_ROUNDS);
```

---

### A03 — Injection Attacks ✅

#### SQL Injection
Not applicable (NoSQL/MongoDB). However, NoSQL injection is addressed:

```javascript
// NEVER do this:
Student.find({ name: req.body.name }); // Direct user input

// ALWAYS sanitize with express-validator:
body('name').trim().escape().isLength({ min: 1, max: 100 }),

// Mongoose automatically parameterizes queries (safe from operator injection)
// express-validator strips MongoDB operators from strings
```

#### XSS Prevention

```javascript
// Backend: helmet sets X-XSS-Protection header
// All user inputs: .trim().escape() via express-validator
// Frontend: React escapes JSX by default (no dangerouslySetInnerHTML)
```

#### Command Injection
No shell execution in the application. N/A.

---

### A04 — Insecure Design ✅

| Check | Status |
|-------|--------|
| Rate limiting on auth endpoints | ✅ `express-rate-limit` on /api/auth/login (5 req/15min) |
| No brute-force on login | ✅ Rate limiter + bcrypt cost makes timing slow |
| Delete operations require confirmation | ✅ Frontend confirmation dialog |
| Payment amount validated server-side | ✅ Cannot exceed remaining fees |
| Course/Batch delete guarded | ✅ Checks for enrolled students before delete |

---

### A05 — Security Misconfiguration ✅

| Check | Implementation |
|-------|---------------|
| CORS locked to frontend domain | `origin: process.env.FRONTEND_URL` |
| Debug mode off in production | `NODE_ENV=production` |
| Stack traces not exposed | Error handler never sends `err.stack` to client |
| Default admin password must be changed | Seed script warns: "CHANGE PASSWORD IMMEDIATELY" |
| Unnecessary HTTP methods blocked | Express Routes only define used methods |

---

### A06 — Vulnerable Components ✅

```bash
# Run before deployment:
npm audit --audit-level=high

# Set up automated dependency scanning via GitHub Dependabot
```

Dependency update policy:
- Security patches: Apply within 48 hours
- Minor updates: Weekly review
- Major updates: On next sprint

---

### A07 — Auth Failures ✅

| Check | Implementation |
|-------|---------------|
| JWT has expiry | `expiresIn: '24h'` |
| Invalid tokens rejected | `jwt.verify()` throws on tampered tokens |
| Expired tokens rejected | JWT library checks `exp` claim |
| No token in localStorage when logged out | `localStorage.removeItem('cidms_token')` on logout |

> ⚠️ **Known limitation:** JWT cannot be revoked before expiry in v1.0.  
> **V2.0 improvement:** Implement token blacklist (Redis) or switch to HttpOnly cookies with CSRF protection.

---

### A08 — Data Integrity Failures ✅

| Check | Implementation |
|-------|---------------|
| API validates input before DB write | express-validator on all POST/PUT routes |
| ObjectId references validated | Mongoose throws on invalid ObjectId |
| Payment amounts cannot be negative | `min: 1` validator on Payment.amount |
| All Mongoose schemas have `required` fields | Defined in each schema |

---

### A09 — Logging & Monitoring ✅

```javascript
// morgan: HTTP access logs
app.use(morgan('combined')); // Production: 'combined' format

// Winston logger for application errors
// Error logs include: timestamp, method, path, error message (NO passwords/tokens)
// Never log: passwords, JWT tokens, MongoDB connection strings
```

> For production: Configure Render's log drain to Papertrail or Logtail for persistent logging.

---

### A10 — SSRF ✅

The application does not make server-side HTTP requests to user-provided URLs. N/A.  
If Cloudinary photo upload is added: validate URL origin to `res.cloudinary.com` only.

---

## 3. Authentication Security

### JWT Configuration

```javascript
// .env values (NEVER commit these)
JWT_SECRET=<minimum-64-char-random-string-generated-with-openssl>
JWT_EXPIRES_IN=24h

// Generate a strong secret:
// openssl rand -base64 64
```

### bcrypt Configuration

```javascript
// Salt rounds = 12 (12 = ~400ms hash time on modern hardware)
// Balance between security and performance
// 10 is too fast; 14+ is too slow for login UX
const SALT_ROUNDS = 12;
```

### Login Rate Limiting (Auth-Specific)

```javascript
// Stricter rate limiting on login endpoint:
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // 5 attempts per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Applied ONLY to POST /api/auth/login
router.post('/login', loginLimiter, loginController);
```

---

## 4. Input Validation & Sanitization

All API endpoints use `express-validator` for validation and sanitization.

### Example: Student Validator

```javascript
// backend/validators/student.validator.js
import { body } from 'express-validator';

export const createStudentValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name max 100 chars')
    .escape(), // HTML entity encoding

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter valid 10-digit Indian mobile'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Invalid email format'),

  body('course')
    .notEmpty().withMessage('Course is required')
    .isMongoId().withMessage('Invalid course ID'),

  body('batch')
    .notEmpty().withMessage('Batch is required')
    .isMongoId().withMessage('Invalid batch ID'),

  body('totalFees')
    .isNumeric().withMessage('Total fees must be a number')
    .isFloat({ min: 0 }).withMessage('Fees cannot be negative'),
];
```

### Validation Middleware

```javascript
// backend/middleware/validate.middleware.js
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
```

---

## 5. API Security Headers

```javascript
// app.js
import helmet from 'helmet';
import cors from 'cors';

// Helmet: Sets 11+ security headers
app.use(helmet());

// CORS: Whitelist only frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Helmet sets these headers:**
| Header | Value | Protects Against |
|--------|-------|----------------|
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-XSS-Protection` | `0` (modern) | Legacy XSS |
| `Strict-Transport-Security` | `max-age=...` | HTTP downgrade |
| `Content-Security-Policy` | Configured | XSS, injection |
| `Referrer-Policy` | `no-referrer` | Info leakage |

---

## 6. Environment Variables Reference

### Backend `.env`

```bash
# ==========================================
# BACKEND ENVIRONMENT VARIABLES
# Copy to .env and fill in values
# NEVER commit .env to git
# ==========================================

# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cidms?retryWrites=true&w=majority

# JWT
JWT_SECRET=<run: openssl rand -base64 64>
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:5173

# Cloudinary (optional - for student photos)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend `.env`

```bash
# ==========================================
# FRONTEND ENVIRONMENT VARIABLES
# Vite requires VITE_ prefix for client-side vars
# ==========================================

VITE_API_URL=http://localhost:5000/api
```

### Production Values

| Variable | Where to Set |
|----------|-------------|
| `MONGO_URI` | Render → Environment Variables |
| `JWT_SECRET` | Render → Environment Variables |
| `FRONTEND_URL` | Render → Environment Variables (Vercel URL) |
| `VITE_API_URL` | Vercel → Environment Variables (Render URL) |

---

## 7. Deployment: MongoDB Atlas

### Setup Steps

1. **Create Atlas Account** → [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create Free Cluster** → M0 Sandbox (512MB, free forever)
3. **Create Database User:**
   ```
   Username: cidms_user
   Password: <strong random password>
   Role: readWrite on cidms database
   ```
4. **Network Access:**
   - Add Render IPs (or `0.0.0.0/0` for simplicity — less secure)
   - Recommended: Set Render outbound IPs specifically
5. **Get Connection String:**
   ```
   mongodb+srv://cidms_user:<password>@cluster0.xxxxx.mongodb.net/cidms
   ```
6. **Test connection** locally before deploying

---

## 8. Deployment: Backend → Render

### Setup Steps

1. **Create Render Account** → [render.com](https://render.com)
2. **New Web Service** → Connect GitHub repo
3. **Configuration:**
   ```
   Name: cidms-api
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```
4. **Environment Variables:** (Render → Environment tab)
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=<Atlas connection string>
   JWT_SECRET=<64-char random string>
   FRONTEND_URL=https://cidms.vercel.app
   ```
5. **Deploy** → Note your API URL: `https://cidms-api.onrender.com`

> ⚠️ **Cold Start:** Render free tier sleeps after 15min of inactivity. Upgrade to paid for production use or use cron ping to keep awake.

### Health Check Endpoint

```javascript
// Add to app.js:
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## 9. Deployment: Frontend → Vercel

### Setup Steps

1. **Create Vercel Account** → [vercel.com](https://vercel.com)
2. **Import GitHub Project** → Select repo
3. **Configuration:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Environment Variables:** (Vercel → Settings → Environment Variables)
   ```
   VITE_API_URL=https://cidms-api.onrender.com/api
   ```
5. **Deploy** → Note your URL: `https://cidms.vercel.app`

### Vercel `vercel.json` (for SPA routing)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

> This ensures React Router handles all routes (not 404 on direct URL access).

---

## 10. Post-Deployment Checklist

### Before Going Live

- [ ] `.env` file is in `.gitignore` — confirm no secrets in git history
- [ ] Default admin password changed from `Admin@123`
- [ ] MongoDB Atlas: IP whitelist tightened to Render IPs only
- [ ] `NODE_ENV=production` on Render
- [ ] CORS `FRONTEND_URL` set to exact Vercel domain
- [ ] HTTPS working on both Vercel and Render URLs
- [ ] Health check endpoint responding: `GET /health`
- [ ] Test login flow on production
- [ ] Test add student on production
- [ ] Test record payment on production
- [ ] Test export on production
- [ ] No console errors in browser DevTools
- [ ] `npm audit` passes with no critical vulnerabilities

### Performance Check

- [ ] Dashboard loads in < 2 seconds (use Lighthouse or WebPageTest)
- [ ] Student list with 50+ records loads in < 1 second
- [ ] All API responses < 300ms (Check Render logs)

---

## 11. Incident Response

### If Admin Account Compromised

```bash
# 1. Immediately: Change JWT_SECRET on Render
#    → This invalidates ALL existing tokens

# 2. SSH into Render console and run:
node scripts/seedAdmin.js --reset
# (Or directly update in MongoDB Atlas UI)

# 3. Change admin password via /api/auth/change-password

# 4. Review MongoDB Atlas access logs for unauthorized queries
```

### If Database Breach Suspected

1. Rotate MongoDB Atlas credentials immediately
2. Update `MONGO_URI` in Render environment variables
3. Enable MongoDB Atlas audit logs
4. Check for unexpected collections or modified documents
5. Notify relevant stakeholders

### If JWT Secret Leaked

1. Generate new secret: `openssl rand -base64 64`
2. Update `JWT_SECRET` in Render
3. All sessions are immediately invalidated
4. Admin will need to log in again

---

*Next: See [SETUP.md](./SETUP.md) for local development setup instructions.*
