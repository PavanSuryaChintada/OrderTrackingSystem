# Order Tracking System

Full-stack order tracking application built with Node.js, React, and SQL.

## Status flow
`PLACED -> PACKED -> SHIPPED -> DELIVERED`

## Tech stack
- Backend: Node.js + Express + PostgreSQL
- Frontend: React + Vite
- Deployment: Vercel + Docker

## Run with Docker
1. Build and start all services:
   - `docker compose up --build`
2. Frontend: `http://localhost:5173`
3. Backend API: `http://localhost:4000/api`
4. Stop services:
   - `docker compose down`

Note: PostgreSQL schema initializes automatically from `backend/sql/init.sql` on first startup.
