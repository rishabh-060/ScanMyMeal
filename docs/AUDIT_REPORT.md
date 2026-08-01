# ScanMyMeal audit report

## Existing architecture

The customer site and admin portal share one Next.js 15.3 App Router application using React 19, Redux Toolkit with redux-persist, Axios, Tailwind CSS 4, react-toastify, and Stripe.js. The Express 4.21 API uses Mongoose 8.10, JWT, bcryptjs, Cloudinary, Nodemailer, Multer, and Stripe. Before this work, controllers contained database and business logic directly and there were no service, validation, cache, background-job, request-correlation, or central error layers.

The database contained User, Address, Product, Category, SubCategory, Cart, Order, and Table models. Table records had no public identifier or API; `qrModel.js` was empty. The application is currently single-restaurant, represented by `DEFAULT_RESTAURANT_ID` rather than introducing a speculative multi-tenant restaurant model.

## Findings

### Order and QR flow

- COD and Stripe checkouts created one order document and one order ID per cart line.
- Prices, discounts, totals, and product details were accepted from the browser.
- The dine-in branch never called the backend.
- QR values were arbitrary table numbers generated only in React state and were not persisted or validated.
- Order history and admin order cards represented products, not checkouts.
- Status strings were inconsistent and transitions were unrestricted.

### Inventory and payment

- `Product.stock` was display-only. Cart and checkout could exceed it, and no deduction/restoration existed.
- Stripe had no pending internal order or inventory reservation.
- Global JSON parsing ran before the webhook route, and the webhook secret was read but never used to verify a signature.
- Webhook retries could duplicate orders. Frontend success state was treated as success without querying the stored payment state.

### Security and correctness

- Refresh handling used `jwt.sign` instead of `jwt.verify`; refresh tokens were saved with the wrong user filter.
- Access and refresh tokens were copied to localStorage despite httpOnly cookies.
- Registration spread the complete request body into the User model.
- Password reset did not require proof of successful OTP verification, and expiry comparison was reversed.
- Category, subcategory, upload, and all admin mutation routes had incomplete authorization coverage.
- Cart quantity updates did not enforce ownership, positive integers, or stock.
- Address creation used an un-awaited save promise and attempted to read its `_id`.
- Uploads had no MIME or size allowlist.
- Error bodies/statuses varied and production errors could expose internal messages.

### Performance and UX

- Admin users/orders and order history were unbounded.
- Menu/category reads were repeatedly fetched without cache invalidation.
- Admin orders did not poll or receive live updates.
- Colors, focus states, controls, loaders, empty states, and status badges were implemented independently.
- The home banner was a static asset and there was no banner model or admin workflow.
- The baseline production build failed when invoked under the host's non-standard `NODE_ENV=development`; the same original code built correctly when the production build used `NODE_ENV=production`.

## Resolution summary

The implementation adds central pricing/order/payment/cache services; grouped schema-v2 orders; public UUID tables; secure QR resolution; atomic conditional stock updates with MongoDB transaction support; idempotent checkout and webhook processing; scheduled reservation release; admin banner, table, inventory, and grouped-order APIs; Redis-backed cache/rate limiting with safe non-critical fallback; secure cookie token rotation; consistent errors/logging/request IDs; indexes; reusable UI primitives; and paginated/grouped customer and admin views.

See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) and [MIGRATION.md](./MIGRATION.md) for operational details.
