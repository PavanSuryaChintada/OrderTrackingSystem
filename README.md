# Order Tracking System

Full-stack order tracking application built with Node.js, React, and SQL.

## Status flow
`PLACED -> PACKED -> SHIPPED -> DELIVERED`

## Tech stack
- Backend: Node.js + Express + PostgreSQL
- Frontend: React + Vite
- Deployment: Vercel + Docker

## Local development
### Backend
1. `cd backend`
2. `copy .env.example .env` (Windows)
3. Set `DATABASE_URL` in `.env`
4. `npm install`
5. `npm run db:init`
6. `npm run dev`

### Frontend
1. `cd frontend`
2. `copy .env.example .env` (Windows)
3. `npm install`
4. `npm run dev`

## Run with Docker
1. Build and start all services:
   - `docker compose up --build`
2. Frontend: `http://localhost:5173`
3. Backend API: `http://localhost:4000/api`
4. Stop services:
   - `docker compose down`

Note: PostgreSQL schema initializes automatically from `backend/sql/init.sql` on first startup.

## Vercel deployment
Detailed deployment steps are available in `DEPLOYMENT.md`.
