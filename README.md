# Coaching Institute Management System (CIDMS)

A modern, full-stack coaching institute management platform designed to help administrators manage students, courses, batches, and fee payments efficiently.

## Features

- **Dashboard:** At-a-glance view of active enrollments, revenue, and pending fees.
- **Student Management:** Register and track student details and progress.
- **Course & Batch Tracking:** Manage different courses and dynamically assign students to batches.
- **Fee & Payment System:** Track installments, total fees, and send automated email reminders for pending payments.
- **Premium UI:** Powered by Tailwind CSS v4, Framer Motion, and 21st.dev components (glassmorphism, subtle gradients, and animated interactions).

## Tech Stack

### Frontend (cs/frontend)
- React / Next.js
- Tailwind CSS v4
- Framer Motion
- Zustand (State Management)
- Lucide Icons
- Recharts

### Backend (cs/backend)
- Node.js / Express
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer (Email services)

## Deployment

Both the Frontend and Backend are designed to be deployed seamlessly on **Vercel**:

- **Backend:** Deployed as a serverless Node.js API via `vercel.json` configuration. Includes connection pooling logic for MongoDB.
- **Frontend:** Next.js application interacting securely with the deployed API endpoint via `NEXT_PUBLIC_API_URL`.

*(Note: Ensure proper environment variables for MongoDB, JWT, and SMTP are set on your hosting platform before deploying.)*
