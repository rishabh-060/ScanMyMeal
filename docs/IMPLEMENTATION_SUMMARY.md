# Implementation summary

## Backend

- `server/services/orderService.js` is the shared DINE_IN, DELIVERY, and TAKEAWAY order path. It loads the authenticated cart, validates fulfilment ownership, recalculates prices, conditionally decrements stock, creates one grouped order, writes inventory audit entries, and clears the cart.
- `server/services/paymentService.js` creates the pending internal order before Stripe Checkout. Signed Stripe events update existing orders and use stored provider event IDs for idempotency. Expired/failed sessions restore inventory.
- `server/models/orderModel.js` adds price snapshots, item arrays, pricing/payment/inventory blocks, normalized statuses, history, public IDs, idempotency, and query indexes while retaining legacy fields.
- Durable Table, Banner, and InventoryAdjustment models and APIs were added. Table QR codes use immutable public UUIDs scoped to the configured restaurant.
- `cacheService` centralizes optional Redis behavior. Cache/rate-limit failures fall back to MongoDB or bounded process memory; order/payment correctness never relies exclusively on Redis.
- Access tokens are short-lived httpOnly cookies. Refresh tokens rotate into a stored SHA-256 digest. Email verification and password reset use expiring signed/random tokens.
- Admin routes now apply authentication plus role authorization once at the router boundary. Image upload uses an allowlist and size limit.
- Request IDs, structured JSON logging, consistent errors, health checks, bounded request bodies, pagination, and reservation cleanup were added.
- Vulnerable legacy runtime packages were upgraded (Express 4.22.2, Mongoose 8.24.1, Cloudinary 2.10, Nodemailer 9, JWT 9.0.3), the patched `path-to-regexp` release is enforced, and unused Morgan/Nodemon dependencies were removed.

## Frontend

- Checkout now sends only fulfilment/instruction data and an idempotency key. The backend uses the authenticated cart and authoritative product records.
- Dine-in, delivery, and takeaway share the checkout page. Table context is resolved by the backend before entering the menu and revalidated during checkout.
- Customer history and admin orders render one card per grouped order with all item quantities, status badges, totals, table/address context, search/filtering, and 10-second reliable polling on the admin screen.
- The payment success page polls the protected order endpoint and shows server payment state.
- Admin pages now manage tables/QRs, inventory adjustments, and full banner create/edit/delete/status/reorder behavior.
- The homepage banner is an accessible responsive carousel with pause, previous/next, image fallback, scheduling, and reduced-motion handling.
- Global amber/emerald design tokens and reusable Button, Input, Card, Modal, EmptyState, StatusBadge, and Skeleton components were introduced.
- Next.js was upgraded within the 15.x line, Axios was upgraded, and patched PostCSS/Sharp resolutions are enforced; the final frontend dependency audit reports zero vulnerabilities.

## Compatibility

Existing route names such as `/api/order/COD-order`, `/api/order/PAID-order`, `/api/order/get-orders`, and `/api/admin/upcoming-orders` remain. New orders populate `orderId`, `order_status`, `payment_status`, `subTotalAmt`, and `totalAmt` alongside schema-v2 fields. Legacy orders remain readable and are never inferred into groups.

## Environment changes

Use `server/.env.example` and `frontend/.env.example`. Important new settings are `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `EMAIL_VERIFICATION_SECRET`, `REDIS_URL`, `REDIS_KEY_PREFIX`, `CLIENT_URL`, `ADMIN_URL`, `DEFAULT_RESTAURANT_ID`, `PAYMENT_WEBHOOK_SECRET`, tax/charge values, and reservation/cache TTLs.

## Known limitations

- Login remains mandatory, so the optional guest-session branch from the specification is intentionally not enabled.
- Admin updates use bounded polling rather than WebSockets. This is reliable with MongoDB as source of truth and avoids adding a scaling layer the existing application did not have.
- Notification email is fire-and-forget rather than a durable external queue. A production queue provider should be selected with deployment infrastructure.
- Provider/Cloudinary/email/database integration tests require project credentials and a MongoDB replica set and are documented as manual staging checks.
