# Raw AI Prompt Log — DriveDeck

This document records the exact, unedited prompts used during the development of the **DriveDeck Car Dealership Inventory System**.

In accordance with the project guidelines, this log demonstrates the progressive buildup of the application—from architectural planning and TDD test design to concurrency handling, frontend UI development, zero-config database fallbacks, and Indian market localization.

---

## Phase 1: Architecture & Monorepo Setup

### Prompt 001
- **Date**: 2026-10-25
- **Tool**: Claude 3.5 Sonnet
- **Prompt**:
```text
I am building a full-stack Car Dealership Inventory Management System named "DriveDeck".
Requirements:
1. npm workspaces monorepo containing `client` (React 18, Vite, TypeScript, Tailwind CSS) and `server` (Node.js, Express, TypeScript, Mongoose).
2. Clean Architecture and SOLID design principles.
3. Strict Test-Driven Development (TDD) workflow with Vitest for both backend and frontend.
4. Authentication with bcrypt password hashing and signed JWT tokens.
5. Role-based access control (Admin vs regular User).

Help me structure the monorepo package.json files, tsconfig setups, and folder layout so that both server and client can be run with a single `npm run dev` command using concurrently.
```

---

## Phase 2: Test-Driven Development (Red Phase)

### Prompt 002
- **Date**: 2026-10-25
- **Tool**: Claude 3.5 Sonnet
- **Prompt**:
```text
Following TDD, I want to write the backend test specs before implementing any business logic or controllers.
Let's create two test suites in Vitest:
1. `src/services/auth.service.test.ts`:
   - Verify that hashPassword produces a secure hash and never stores the plaintext password.
   - Verify that verifyPassword correctly validates true passwords and rejects incorrect passwords.
2. `src/app.test.ts`:
   - Integration tests with Supertest against an in-memory database.
   - User registration and JWT issuance.
   - Duplicate email registration rejection (409 Conflict).
   - Valid vs invalid login credentials.
   - Protected vehicle routes requiring a Bearer token.
   - Admin-only routes (restock and delete) returning 403 Forbidden for non-admin users and 200/204 for admins.

Write the complete Vitest test file with mock setup and assertions so I can run `npm test` and verify that the tests fail initially (Red phase).
```

---

## Phase 3: Concurrency Safety & Atomic Inventory Decrement

### Prompt 003
- **Date**: 2026-10-25
- **Tool**: Claude 3.5 Sonnet
- **Prompt**:
```text
In the vehicle purchase endpoint `POST /api/vehicles/:id/purchase`, multiple users might click "Purchase" on the last remaining car at the exact same moment.
If I do:
const vehicle = await Vehicle.findById(id);
if (vehicle.quantity > 0) {
  vehicle.quantity -= 1;
  await vehicle.save();
}
This has a classic read-modify-write race condition that will oversell inventory under concurrent requests.

Show me how to implement this using atomic MongoDB conditional updates (`findByIdAndUpdate` or `findOneAndUpdate` with `{ quantity: { $gt: 0 } }` and `$inc: { quantity: -1 }`) so that the decrement is atomic and returns a 409 or 400 when stock is 0. Also write a specific Vitest integration test case in `src/app.test.ts` to assert that purchasing when quantity is 0 is strictly rejected.
```

---

## Phase 4: Frontend UI Components & State Management

### Prompt 004
- **Date**: 2026-10-25
- **Tool**: GitHub Copilot / Gemini 1.5 Pro
- **Prompt**:
```text
I am building the presentation layer for the dealership inventory in React with Tailwind CSS and Lucide React icons.
Create:
1. `VehicleCard.tsx`:
   - Displays vehicle image (or fallback icon), category pill, make, model, formatted price, stock availability pill ('in stock' vs 'out of stock').
   - "Purchase" button with shopping cart icon that is disabled when `quantity === 0` or while request is processing.
   - If `isAdmin` is true, display an edit button with a gauge icon.
2. `VehicleCard.test.tsx`:
   - Test rendering vehicle make and model.
   - Test that purchase button is enabled when stock > 0.
   - Test that purchase button is disabled with "Out of stock" label when quantity is 0.
   - Test that clicking purchase triggers the `onPurchase(id)` callback.
```

---

## Phase 5: Zero-Config Developer Experience & CORS Troubleshooting

### Prompt 005
- **Date**: 2026-10-25
- **Tool**: Gemini 1.5 Pro
- **Prompt**:
```text
When an evaluator or interviewer clones this repo, they might not have a local MongoDB daemon actively running on port 27017, and the server would crash with MongooseServerSelectionError.
How can I enhance `server/src/index.ts` so it first attempts to connect to `process.env.MONGODB_URI`, and if the connection fails or is refused, automatically spins up `MongoMemoryServer` as a transparent zero-dependency fallback, seeds the demo data, and logs the credentials?

Also, when calling the API from `http://127.0.0.1:5173` vs `http://localhost:5173`, the browser triggers CORS errors. How should I configure Vite's dev proxy in `client/vite.config.ts` to proxy `/api` calls directly to `http://localhost:4000` so that requests are same-origin and never blocked by CORS?
```

---

## Phase 6: Indian Market Localization

### Prompt 006
- **Date**: 2026-10-25
- **Tool**: Claude 3.5 Sonnet
- **Prompt**:
```text
I want to adapt DriveDeck specifically for the Indian automotive market:
1. Update `VehicleCard.tsx` and all pricing displays to show the Indian Rupee symbol (`₹`) formatted with `en-IN` numbering conventions (e.g., ₹8,49,000 instead of $849,000).
2. Update the seed database in `server/src/seed.ts` to replace foreign luxury cars with popular Indian car models across diverse categories with realistic ex-showroom prices in INR:
   - Hatchbacks: Maruti Suzuki Swift ZXi+
   - Sedans: Maruti Suzuki Dzire ZXi, Honda City ZX
   - Compact & Midsize SUVs: Tata Nexon Fearless+, Hyundai Creta SX(O)
   - 4x4 / Adventure SUVs: Mahindra Thar 4x4 Hard Top
   - Premium SUVs / MPVs: Toyota Innova Crysta GX, Mahindra XUV700 AX7, Toyota Fortuner 4x4 Legender, Tata Harrier
3. Ensure the database seeding logic detects if Indian car models are already present, and replaces old listings cleanly.
```

---

## Phase 7: Interactive E-Commerce UX (Budget Filters, Sorting & Receipt Modal)

### Prompt 007
- **Date**: 2026-10-25
- **Tool**: Claude 3.5 Sonnet
- **Prompt**:
```text
I want to enhance the customer shopping experience on the DriveDeck dashboard with two high-value features:
1. Budget Filtering & Sorting:
   - Add clickable quick-budget pill buttons for "All Budgets", "Under ₹10 Lakh", "₹10L – ₹20 Lakh", and "Above ₹20 Lakh".
   - Add a Sort dropdown with options: "Featured", "Price: Low to High", "Price: High to Low", and "Most Stock First".
   - Combine these filters with the existing text search and category dropdown cleanly in a memoized selector.
2. Order Confirmation Receipt Modal:
   - When a purchase succeeds, open a celebratory receipt modal rather than a simple inline notification.
   - Include a green confirmation badge, dynamic Order ID reference (#DD-XXXXXX), vehicle details, formatted amount paid in ₹, remaining units left on lot, timestamp, and a "Print Slip" button that triggers window.print().

Implement this in `client/src/pages/Dashboard.tsx` cleanly adhering to existing styles and Lucide React icons.
```

