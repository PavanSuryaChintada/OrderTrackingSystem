# Project Q&A Summary

## Brief Description of Project (What does it do?)
This is an Order Tracking System.
It lets users create an order, see its current status, and move it through a fixed flow:

Placed -> Packed -> Shipped -> Delivered

It has a React frontend, Node.js backend, and SQL database.

## Key Features Implemented
- Create a new order (customer, product, quantity)
- View all orders in a table
- Search an order by ID
- Update order status step-by-step
- Status flow validation (cannot skip or move backward)
- Backend APIs with input validation and error handling
- Docker setup for local run
- Vercel-ready deployment setup for frontend and backend

## Challenges Faced and How You Overcame Them
- Deployment issues on Vercel: backend could not connect to database at first.
  - Fixed by configuring correct cloud DB environment variables and SSL settings.
- Frontend "Failed to fetch" errors: API URL/config mismatch during deployment.
  - Fixed by setting proper VITE_API_BASE_URL and redeploying.
- Database table missing in cloud ("orders" relation not found):
  - Fixed by running SQL schema (init.sql) in Supabase SQL Editor.

## What was the most important learning takeaway from this assignment?
My biggest learning was:
Building features is only half the job — deployment and environment setup are equally important.

I learned how to:
- keep backend/frontend configs clean,
- handle real-world deployment errors,
- and make the app stable both locally and on live URLs.
