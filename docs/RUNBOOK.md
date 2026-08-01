# Local and production runbook

## Install

```powershell
cd server
npm ci
Copy-Item .env.example .env
cd ..\frontend
npm ci
Copy-Item .env.example .env.local
```

Fill secrets locally; never commit `.env` or `.env.local`.

## Redis

From the repository root:

```powershell
docker compose up -d redis
docker compose ps
```

The API remains functional without Redis, but cache/rate-limit behavior uses process-local fallback.

## MongoDB transactions

Use MongoDB Atlas or a replica set. Set `MONGODB_URI` accordingly. Transactions are the production boundary for grouped order creation, stock adjustment, cart cleanup, and restoration. A standalone development MongoDB receives a logged warning and uses compensating stock restoration.

## Run

Backend:

```powershell
cd server
npm run dev
```

Customer and admin portal (one Next.js app):

```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000`; admin pages are under `/admin`.

## Validation

```powershell
cd server
npm run lint
npm test
cd ..\frontend
$env:NODE_ENV='production'
npm run build
```

The production server command is `npm start` in each package after building the frontend. Run the migration with the commands in [MIGRATION.md](./MIGRATION.md).

## Stripe webhook

Configure the provider to send Checkout events to `https://YOUR_API/api/order/web-hook`. Store the signing secret in `PAYMENT_WEBHOOK_SECRET`. Subscribe to `checkout.session.completed`, `checkout.session.expired`, and `checkout.session.async_payment_failed`.
