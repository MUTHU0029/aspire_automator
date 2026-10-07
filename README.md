# GATE & NPTEL Management System

Full stack MERN college dashboard for faculty and student workflows.

## Features

- JWT authentication with role-based authorization
- Faculty dashboard for GATE scores and NPTEL approvals
- Student dashboard for GATE score viewing and NPTEL submissions
- PDF certificate upload with restriction to 5 MB and PDF-only validation
- Role-aware protected routes and backend enforcement
- MongoDB-backed models for users, GATE scores and NPTEL submissions
- Seed script with default credentials

## Default credentials

Faculty:
- Email: faculty@college.edu
- Password: Faculty@123

Student:
- Email: student1@college.edu
- Password: Student@123

## Run locally

1. Install dependencies:
   npm install
2. Start backend:
   npm run start --workspace server
3. Start frontend:
   npm run dev --workspace client
4. Seed data (optional):
   npm run seed --workspace server

The app is configured to run on:
- Backend: http://localhost:5001
- Frontend: http://localhost:5175

## Notes

- The backend reads environment variables from server/.env.
- If no Mongo URI is configured, the server falls back to an in-memory MongoDB instance for local development.
