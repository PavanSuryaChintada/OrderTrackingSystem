# Deployment Runbook

This project is deployed as two Vercel projects:
- `frontend/` (React app)
- `backend/` (Node serverless API)

## 1) Deploy backend to Vercel

### Project root
Set Vercel project root directory to: `backend`

### Required environment variables
- `DATABASE_URL` = your managed PostgreSQL connection string
- `PORT` = `4000` (optional on Vercel, included for consistency)

### Notes
- Backend uses `backend/vercel.json` and exposes Express through `backend/api/index.js`.
- API base path remains `/api/*` (example: `/api/health`).

## 2) Deploy frontend to Vercel

### Project root
Set Vercel project root directory to: `frontend`

### Required environment variables
- `VITE_API_BASE_URL` = deployed backend URL + `/api`
  - Example: `https://order-tracking-backend.vercel.app/api`

### Notes
- Frontend uses `frontend/vercel.json` to rewrite all routes to `index.html`.

## 3) Post deployment verification

1. Open backend URL: `/api/health`
2. Open frontend URL
3. Create an order from UI
4. Advance status through all stages
5. Verify status cannot skip stages

## 4) Database recommendation
Use managed PostgreSQL (Neon, Supabase, Railway, or Render Postgres) in production.
Run schema from `backend/sql/init.sql` once on the production database.
