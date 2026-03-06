# Warehouse Backend

Production-grade inventory backend built with NestJS and MongoDB Atlas.

## Features

- JWT authentication (`/api/v1/auth/login`, `/api/v1/auth/refresh`)
- Product management (`/api/v1/products`)
- Inventory stock in/out (single + bulk)
- Inventory movement ledger/audit history
- Reporting APIs (inventory summary, stock movement, profit/loss)
- Role-based access control (admin/staff)
- Validation, throttling, consistent error response, request ID propagation
- Swagger docs at `/docs`

## Tech Stack

- NestJS + TypeScript
- MongoDB Atlas + Mongoose
- JWT + Passport
- class-validator / class-transformer
- Multer + XLSX parser

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and fill values:

```bash
cp env.example .env
```

Set `CORS_ORIGIN` to your frontend URL (default: `http://localhost:3000`).

3. Start in dev mode:

```bash
npm run start:dev
```

API base URL: `http://localhost:3001/api/v1`
Swagger URL: `http://localhost:3001/docs`

## Vercel Deploy

- `vercel.json` is configured for serverless Nest handler at `api/index.ts`
- In Vercel project settings, set Root Directory to `warehouse-backend` (if deploying from parent workspace)
- Add env vars in Vercel: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`
- Recommended `CORS_ORIGIN` value: your frontend deployed URL

## Seed Demo Data

```bash
npm run seed
```

This creates:
- Admin user: `admin / Admin@123`
- 3 sample products

## Key Business Rules

- No negative stock allowed
- Stock-out fails when `qty > currentQty`
- Weighted Average Cost is recalculated on stock-in
- Profit/loss is computed on stock-out and saved in movement ledger
- Every stock change writes an `InventoryMovement` record

## Main Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `POST /api/v1/products/bulk-upload`
- `POST /api/v1/inventory/stock-in`
- `POST /api/v1/inventory/stock-out`
- `POST /api/v1/inventory/stock-in/bulk`
- `POST /api/v1/inventory/stock-out/bulk`
- `GET /api/v1/inventory/movements`
- `GET /api/v1/reports/inventory-summary`
- `GET /api/v1/reports/stock-movement?from=&to=`
- `GET /api/v1/reports/profit-loss?from=&to=`

## Project Structure

```
src/
  main.ts
  app.module.ts
  common/
  modules/
    auth/
    users/
    products/
    inventory/
    bulk-upload/
    reports/
```
