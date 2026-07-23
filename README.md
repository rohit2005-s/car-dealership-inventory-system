# Car Dealership Inventory System

A full-stack inventory & purchase management system for a car dealership, built with TDD.

**Stack:** React (Vite) + Tailwind + React Router + Axios (frontend) · Node/Express/TypeScript + Prisma/PostgreSQL + JWT (backend) · Jest + Supertest (testing).

## Status

Currently at **Phase 1 — Project Architecture**. Full setup instructions, API docs, and deployment guide will be filled in as each phase completes (see project plan below).

## Project Phases

1. ✅ Architecture & folder structure
2. ⬜ Database schema (Prisma)
3. ⬜ Backend authentication
4. ⬜ Vehicle & inventory APIs
5. ⬜ Full test suite (TDD)
6. ⬜ Frontend
7. ⬜ Deployment

## Quick Start (current scaffold)

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev      # http://localhost:5000
npm test

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev       # http://localhost:5173
```

## Folder Structure

```
backend/src/{controllers,routes,services,middlewares,validators,utils,types}
backend/prisma/schema.prisma
backend/tests/{auth,vehicles}
frontend/src/{pages,components,context,services,hooks,routes}
```

Full documentation (API reference, env vars, deployment) lands in later phases.
