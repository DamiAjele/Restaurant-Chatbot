# Restaurant Chatbot (ChopBot)

This is a simple restaurant chatbot with a TypeScript + Express backend and a React frontend. The backend uses Prisma (PostgresSQL) and integrates with Paystack for payments (test mode).

Quick links

- Frontend: [Frontend](Frontend)

Prerequisites

- Node.js 18+ and npm
- PostgreSQL 

Environment variables

- Backend: copy `Backend/.env.example` → `Backend/.env` and set:
  - `DATABASE_URL`
  - `PAYSTACK_SECRET_KEY`
  - `PAYSTACK_PUBLIC_KEY` 
  - `CLIENT_URL`
  - `PORT` 
- Frontend: create `Frontend/.env` with:
  - `VITE_PAYSTACK_PUBLIC_KEY` (your Paystack test public key)

Backend — setup & run

1. Install dependencies

```bash
cd Backend
npm install
```

2. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Seed the database (adds sample menu items)

```bash
npm run seed
```

4. Start the dev server

```bash
npm run dev
```

The backend API will be available at `http://localhost:4000/api` (or the `PORT` you set).

Frontend — setup & run

1. Install dependencies

```bash
cd Frontend
npm install
```

2. Add Paystack public key to `Frontend/.env`:

```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...your_key_here
```

3. Start the dev server

```bash
npm run dev
```

The frontend will typically run at `http://localhost:3000` (Vite default).

End-to-end run

1. Start the backend (Backend). 2. Start the frontend (Frontend). Open the frontend URL and interact with the chatbot.

Troubleshooting

- Payment initialization fails: ensure `PAYSTACK_SECRET_KEY` is set on the backend and that the session has a `PLACED` order before initializing payment (or place the order first).
- CORS: set `CLIENT_URL` in `Backend/.env` to match the frontend origin.
- Prisma errors after schema changes: run `npx prisma generate` again.

Useful scripts

- Backend: `npm run dev`, `npm run seed`, `npx prisma generate`, `npx prisma migrate dev --name init`
- Frontend: `npm run dev`, `npm run build`

Project layout

- Backend/ — TypeScript Express server, Prisma schema, seed script
- Frontend/ — React + Vite app

