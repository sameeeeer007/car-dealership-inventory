# DriveDeck — Car Dealership Inventory System

A full-stack inventory SPA built with React + TypeScript + Vite + Tailwind CSS and an Express + TypeScript REST API backed by MongoDB/Mongoose. It includes JWT authentication, role-based authorization, inventory operations, and automated tests.

## Features

- Registration and login with bcrypt password hashing and signed JWTs.
- Authenticated inventory listing, search by make/model/category/price, create and update.
- Atomic stock decrement on purchase; the final unit cannot be oversold by concurrent requests.
- Admin-only delete and restock endpoints.
- Responsive dashboard, category filtering, stock-aware purchase actions, and admin controls.
- Vitest/Supertest backend API tests and React Testing Library component tests.

## Prerequisites

- Node.js 20+ and npm 10+
- MongoDB 6+ (local or managed MongoDB Atlas)
- Git

## Run locally

```bash
git clone <your-repository-url>
cd car-dealership-inventory
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Set `MONGODB_URI` and a long random `JWT_SECRET` in `server/.env`. Keep `.env` files out of Git. `CLIENT_ORIGIN` should match the frontend origin. For a local setup, use `http://localhost:5173`.

In a second terminal, confirm MongoDB is running, then:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000
- Health check: http://localhost:4000/api/health

## Test and build

```bash
npm test                 # backend and frontend suites
npm run test -w server   # backend API + service tests
npm run test -w client   # React component tests
npm run build            # type-check and build both workspaces
```

Backend integration tests use an ephemeral MongoDB instance. If your environment cannot download MongoDB Memory Server binaries, configure a dedicated test database or run the tests in an environment with the required binary available.

## API summary

All vehicle routes require `Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create regular user |
| POST | `/api/auth/login` | Public | Authenticate |
| GET | `/api/vehicles` | Authenticated | List inventory |
| GET | `/api/vehicles/search` | Authenticated | Filter inventory |
| POST | `/api/vehicles` | Authenticated | Create listing |
| PUT | `/api/vehicles/:id` | Authenticated | Update listing |
| POST | `/api/vehicles/:id/purchase` | Authenticated | Decrease quantity by one |
| POST | `/api/vehicles/:id/restock` | Admin | Increase quantity |
| DELETE | `/api/vehicles/:id` | Admin | Delete listing |

### Admin provisioning

For safety, public registration ignores the submitted role and always creates a `user`. Do not expose a public `role: "admin"` switch: that would let anyone grant themselves admin access. Create the first admin via a trusted one-off script, a protected internal operation, or a database migration. Example in a trusted Node environment after configuring the server environment:

```ts
import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import { hashPassword } from "./src/services/auth.service.js";
await mongoose.connect(process.env.MONGODB_URI!);
await User.create({
  email: "admin@example.com",
  passwordHash: await hashPassword(process.env.INITIAL_ADMIN_PASSWORD!),
  role: "admin"
});
await mongoose.disconnect();
```

Never commit the admin password. Run this script once, then remove/disable the bootstrap secret.

## Deployment notes

The `server/api/index.ts` adapter and `server/vercel.json` are included as a starting point for Vercel serverless deployment. Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` in deployment environment variables. Deploy the frontend separately (e.g. Vercel/Netlify) and set `VITE_API_URL` to the deployed API base URL. Verify your deployment's build/output settings before production use.

## Security and production checklist

- Use a high-entropy `JWT_SECRET`; rotate secrets and use HTTPS in production.
- Configure exact CORS origins; do not use wildcard origins with credentialed requests.
- Add rate limiting, structured logging, request IDs, monitoring, and security headers before public production deployment.
- Add pagination and indexes for large inventories.
- Define an audited admin-provisioning process and consider refresh-token/session revocation needs.
- Browser localStorage is used for the assignment's persistent JWT requirement; for higher-risk production systems, evaluate secure, HttpOnly cookies and CSRF controls.
- Validate any external image URL and consider an image proxy/content policy.
- Do not treat the provided tests as exhaustive; add more edge cases and run the suite in your target environment.

## My AI Usage

> **Edit this section to accurately reflect your actual usage before submission. Do not claim tools or actions you did not use.**

### Tools used
- AI assistant: ChatGPT (OpenAI) — used as a development aid for architecture brainstorming, scaffolding, test-case ideation, code review prompts, and documentation drafting. Amend this list if you used other tools.

### How AI was used
- Helped outline a layered Express architecture and the React client structure.
- Suggested tests for password hashing, authentication, inventory CRUD, role authorization, and out-of-stock purchases.
- Assisted with TypeScript types, request validation patterns, and UI component scaffolding.
- Helped draft setup instructions and a checklist of production-hardening tasks.

### Human review and verification
- I am responsible for reviewing, understanding, testing, and validating all submitted code.
- I will run the tests, inspect generated code, verify edge cases, and correct issues before submission.
- I will keep the prompt log in `PROMPTS.md` as a raw record of prompts used, without presenting AI-generated summaries as raw logs.

### Reflection
AI accelerated initial scaffolding and helped identify implementation patterns, but generated code can contain errors and security gaps. I reviewed the architecture and will verify behavior locally. In particular, admin provisioning, environment secrets, concurrency behavior, and deployment configuration require careful review. Replace this reflection with your own experience and specific examples before submitting.
