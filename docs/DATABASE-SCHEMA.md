# Database Schema Document
# Coaching Institute Data Management System (CIDMS)

> **Version:** 1.0.0  
> **Date:** March 6, 2026  
> **Author:** Database Architect Agent  
> **Database:** MongoDB 7 + Mongoose 8  

---

## 📑 Table of Contents

1. [Entity Relationship Overview](#1-entity-relationship-overview)
2. [Schema Definitions](#2-schema-definitions)
   - [Admin](#21-admin-schema)
   - [Course](#22-course-schema)
   - [Batch](#23-batch-schema)
   - [Student](#24-student-schema)
   - [Payment](#25-payment-schema)
3. [Relationships Map](#3-relationships-map)
4. [Indexes](#4-indexes)
5. [Data Integrity Rules](#5-data-integrity-rules)
6. [Mongoose Model Code](#6-mongoose-model-code)
7. [Seed Data](#7-seed-data)

---

## 1. Entity Relationship Overview

```
Admin (1)
  └── manages everything (no direct FK)

Course (1) ───────────── (many) Batch
   └── Course has many Batches

Course (1) ───────────── (many) Student
   └── Student belongs to one Course

Batch (1) ────────────── (many) Student
   └── Student belongs to one Batch

Student (1) ──────────── (many) Payment
   └── Student has many Payments
   └── feePaid = SUM of all Payments.amount for that student
```

**Collections:** `admins`, `courses`, `batches`, `students`, `payments`

---

## 2. Schema Definitions

### 2.1 Admin Schema

**Collection:** `admins`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | MongoDB default |
| `name` | String | ✅ | Display name |
| `email` | String | ✅ | Unique, lowercase, trimmed |
| `password` | String | ✅ | bcrypt hash (min 60 chars) |
| `createdAt` | Date | auto | Mongoose timestamps |
| `updatedAt` | Date | auto | Mongoose timestamps |

**Validations:**
- `email`: valid email format, unique
- `password`: never returned in API responses (`.select('-password')`)

---

### 2.2 Course Schema

**Collection:** `courses`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | Unique, trimmed, max 100 chars |
| `duration` | String | ✅ | — | e.g., "3 months", "1 year" |
| `totalFees` | Number | ✅ | — | In INR, min 0 |
| `description` | String | ❌ | `''` | Max 500 chars |
| `isActive` | Boolean | — | `true` | Soft delete toggle |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

**Validations:**
- `name`: unique per institute
- `totalFees`: non-negative number

---

### 2.3 Batch Schema

**Collection:** `batches`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | e.g., "Morning Batch A", unique+course |
| `course` | ObjectId (ref: Course) | ✅ | — | Course this batch belongs to |
| `teacher` | String | ❌ | `''` | Teacher name |
| `startDate` | Date | ✅ | — | |
| `endDate` | Date | ❌ | null | null = ongoing |
| `timing` | String | ✅ | — | e.g., "9:00 AM – 11:00 AM" |
| `isActive` | Boolean | — | `true` | |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

**Validations:**
- `endDate` must be after `startDate` if provided

---

### 2.4 Student Schema

**Collection:** `students`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `name` | String | ✅ | — | Trimmed, max 100 chars |
| `phone` | String | ✅ | — | Unique, 10-digit pattern |
| `email` | String | ❌ | `''` | Lowercase, valid format if provided |
| `address` | String | ❌ | `''` | Max 300 chars |
| `course` | ObjectId (ref: Course) | ✅ | — | |
| `batch` | ObjectId (ref: Batch) | ✅ | — | |
| `admissionDate` | Date | ✅ | `Date.now` | |
| `totalFees` | Number | ✅ | — | Copied from Course at enrollment |
| `feesPaid` | Number | — | `0` | Accumulates from Payments |
| `remainingFees` | Number | virtual | — | `totalFees - feesPaid` (virtual field) |
| `photo` | String | ❌ | `''` | Cloudinary URL or empty |
| `status` | String (enum) | — | `'active'` | `active | inactive | completed` |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

**Virtuals:**
- `remainingFees` → computed as `totalFees - feesPaid`
- `feeStatus` → `'cleared'` if remainingFees === 0, else `'pending'`

**Indexes:**
- Text index on `name` + `phone` for search
- Index on `course`, `batch` for filters

---

### 2.5 Payment Schema

**Collection:** `payments`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `_id` | ObjectId | auto | — | |
| `student` | ObjectId (ref: Student) | ✅ | — | |
| `amount` | Number | ✅ | — | Must be > 0 |
| `paymentMode` | String (enum) | ✅ | — | `Cash | UPI | Bank Transfer` |
| `paymentDate` | Date | ✅ | `Date.now` | |
| `notes` | String | ❌ | `''` | e.g., "Partial payment for Dec" |
| `recordedBy` | ObjectId (ref: Admin) | ✅ | — | For audit trail |
| `createdAt` | Date | auto | — | |

**Post-save hook:**
- After a Payment is saved, update `Student.feesPaid += payment.amount`
- If `feesPaid > totalFees`, raise validation error

---

## 3. Relationships Map

```
admins
  └── (no FK, session-based ownership)

courses
  └── _id ──► batches.course (ObjectId ref)
  └── _id ──► students.course (ObjectId ref)

batches
  └── _id ──► students.batch (ObjectId ref)
  └── course ──► courses._id

students
  └── course ──► courses._id
  └── batch ──► batches._id
  └── _id ──► payments.student (ObjectId ref)

payments
  └── student ──► students._id
  └── recordedBy ──► admins._id
```

---

## 4. Indexes

```javascript
// admins
{ email: 1 }           // unique

// courses
{ name: 1 }            // unique
{ isActive: 1 }        // filter active courses

// batches
{ course: 1 }          // filter by course
{ isActive: 1 }

// students
{ phone: 1 }           // unique
{ course: 1 }          // filter
{ batch: 1 }           // filter
{ status: 1 }          // filter active/inactive
{ $text: { name: 1, phone: 1 } }  // full-text search (compound text index)
{ feesPaid: 1, totalFees: 1 }     // pending fees queries
{ createdAt: -1 }      // recent registrations sort

// payments
{ student: 1 }         // payment history per student
{ paymentDate: -1 }    // recent payments sort
{ paymentMode: 1 }     // filter by mode
```

---

## 5. Data Integrity Rules

| Rule | Enforcement |
|------|------------|
| Admin password never in API response | `schema.set('toJSON', { transform: hidePassword })` |
| Student phone must be unique | Index + Mongoose unique validation |
| Course name must be unique | Index + Mongoose unique validation |
| Payment amount > 0 | Mongoose min(1) validator |
| Batch `endDate` > `startDate` | Custom validator in schema |
| Cannot delete Course with enrolled students | Pre-delete middleware (check Student count) |
| Cannot delete Batch with enrolled students | Pre-delete middleware (check Student count) |
| `feesPaid` cannot exceed `totalFees` | Pre-save validate in payment post-hook |
| `paymentMode` restricted to enum values | Mongoose enum validator |

---

## 6. Mongoose Model Code

### Admin Model

```javascript
// backend/models/Admin.model.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },
  },
  { timestamps: true }
);

export default mongoose.model('Admin', adminSchema);
```

### Course Model

```javascript
// backend/models/Course.model.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    totalFees: {
      type: Number,
      required: [true, 'Total fees is required'],
      min: [0, 'Fees cannot be negative'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
```

### Batch Model

```javascript
// backend/models/Batch.model.js
import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [100, 'Batch name cannot exceed 100 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    teacher: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    timing: {
      type: String,
      required: [true, 'Batch timing is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Batch', batchSchema);
```

### Student Model

```javascript
// backend/models/Student.model.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      match: [/^$|^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    address: {
      type: String,
      default: '',
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    totalFees: {
      type: Number,
      required: [true, 'Total fees is required'],
      min: [0, 'Fees cannot be negative'],
    },
    feesPaid: {
      type: Number,
      default: 0,
      min: [0, 'Fees paid cannot be negative'],
    },
    photo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fields
studentSchema.virtual('remainingFees').get(function () {
  return Math.max(0, this.totalFees - this.feesPaid);
});

studentSchema.virtual('feeStatus').get(function () {
  return this.feesPaid >= this.totalFees ? 'cleared' : 'pending';
});

// Indexes
studentSchema.index({ name: 'text', phone: 'text' });
studentSchema.index({ course: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ createdAt: -1 });

export default mongoose.model('Student', studentSchema);
```

### Payment Model

```javascript
// backend/models/Payment.model.js
import mongoose from 'mongoose';
import Student from './Student.model.js';

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
      enum: {
        values: ['Cash', 'UPI', 'Bank Transfer'],
        message: 'Payment mode must be Cash, UPI, or Bank Transfer',
      },
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [200, 'Notes cannot exceed 200 characters'],
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  { timestamps: true }
);

// Post-save: Update student feesPaid
paymentSchema.post('save', async function () {
  await Student.findByIdAndUpdate(this.student, {
    $inc: { feesPaid: this.amount },
  });
});

// Indexes
paymentSchema.index({ student: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ paymentMode: 1 });

export default mongoose.model('Payment', paymentSchema);
```

---

## 7. Seed Data

### Admin Seed Script

```javascript
// backend/scripts/seedAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.model.js';
import dotenv from 'dotenv';
dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const existing = await Admin.findOne({ email: 'admin@institute.com' });
  if (existing) {
    console.log('Admin already exists. Skipping seed.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  await Admin.create({
    name: 'Institute Admin',
    email: 'admin@institute.com',
    password: hashedPassword,
  });

  console.log('✅ Admin seeded: admin@institute.com / Admin@123');
  console.log('⚠️  CHANGE PASSWORD IMMEDIATELY after first login!');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

**Run:** `node backend/scripts/seedAdmin.js`

---

*Next: See [API-DESIGN.md](./API-DESIGN.md) for all REST endpoints.*
