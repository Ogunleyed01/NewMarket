# NewMarket

NewMarket is a campus-focused multi-vendor marketplace built with React, Vite, Express, Prisma, and PostgreSQL, designed for student buying, selling, and checkout on campus.


## Features

- Buyer signup and login with role-aware marketplace access
- Vendor onboarding with store creation and product publishing
- Product catalog browsing with category filtering and search
- Cart-based checkout with Paystack-ready payment flow
- Order tracking and vendor fulfillment updates
- Admin-protected overview endpoints and role-based access control
- Cloudinary-hosted media uploads for stores and products
- Responsive storefront and dashboard UI for campus commerce

## Tech stack

- Frontend: React + Vite + Tailwind
- Backend: Express + Node.js
- Database: PostgreSQL via Prisma
- Payments: Paystack
- Media: Cloudinary
- Deployment: Vercel for frontend, Render for backend

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL database
- Paystack account for payment processing
- Cloudinary account for hosted uploads

## Local setup

1. Install dependencies:

   npm install

2. Create your environment file:

   Copy .env.example to .env, then update the values with your real local or deployed keys.

3. Configure local environment variables:

   Required values include:
   - DATABASE_URL
   - JWT_SECRET
   - PAYSTACK_SECRET_KEY
   - PAYSTACK_PUBLIC_KEY
   - PAYSTACK_CALLBACK_URL
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - VITE_API_URL
   - FRONTEND_URL

4. Generate and apply the database schema:

   npx prisma migrate dev --name init

5. Start the app:

   npm run dev

   This starts the Express API and Vite frontend together. The frontend runs on port 3000 and the API runs on port 5000.

## Production deployment

This app is set up for a split deployment model:

- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL database service

### Render backend

Use the repository root as the Render root directory, and set the start command to:

npx prisma migrate deploy && node server/index.js

Set these environment variables in the Render service:

- DATABASE_URL
- JWT_SECRET
- PAYSTACK_SECRET_KEY
- PAYSTACK_PUBLIC_KEY
- PAYSTACK_CALLBACK_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_URL
- NODE_ENV=production

### Vercel frontend

Set the frontend environment variable:

- VITE_API_URL=https://your-render-backend-url/api/v1

Also set:

- FRONTEND_URL=https://your-vercel-app-url

## API overview

All routes use the /api/v1 prefix.

- GET /health
- POST /auth/register
- POST /auth/login
- GET /auth/me
- GET /stores
- POST /stores
- GET /products
- POST /products
- POST /uploads
- POST /orders/checkout
- GET /payments/verify/:reference
- POST /payments/webhook
- GET /orders/my-orders
- GET /vendor/orders
- PATCH /vendor/orders/:id/status
- GET /admin/overview

## Available scripts

- npm run dev — start frontend and backend together
- npm run client — start the Vite frontend only
- npm run server — start the backend server
- npm run build — build the frontend for production
- npm run preview — preview the production build locally
- npm run prisma:generate — generate Prisma client
- npm run prisma:push — push Prisma schema changes to the configured database
- npm run prisma:deploy — apply pending migrations in production
- npm run prisma:studio — open Prisma Studio
