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

- PORT=5001
MONGO_URI=mongodb+srv://muthuofficial29_db_user:nCkwDSL5QeU7I2UD@cluster1.llgc4ly.mongodb.net/?appName=Cluster1
JWT_SECRET=b75ec2e5d5dce0d0de003576b7f08beb32c9ab4e279a650e083d4516f0c77e8a9e055c73d5d8ac73cc597811fccd27b298d3891ac663546c93c4fabeccae2220
CLIENT_URL=http://localhost:5175

