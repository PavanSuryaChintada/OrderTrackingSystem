# Backend (Order Tracking API)

## Setup
1. Copy environment variables:
   - `cp .env.example .env` (Linux/macOS)
   - `copy .env.example .env` (Windows)
2. Update `DATABASE_URL` in `.env`.
3. Initialize schema:
   - `npm run db:init`
4. Start server:
   - `npm run dev`

## Order status workflow
Fixed lifecycle:
`PLACED -> PACKED -> SHIPPED -> DELIVERED`
