# API reference

All JSON success responses include `success: true`; errors include `success: false`, `message`, `code`, and `requestId`. Cookie authentication is preferred. Admin endpoints require an active `ADMIN` user.

## Orders and payments

| Method | Endpoint | Auth | Request | Result / notable errors |
| --- | --- | --- | --- | --- |
| POST | `/api/order/COD-order` | User | Header `Idempotency-Key`; `orderType`, and `addressId`, `tableId`, or pickup fields as applicable | `201` grouped order; `EMPTY_CART`, `INVALID_TABLE`, `ADDRESS_NOT_FOUND`, `INSUFFICIENT_STOCK` |
| POST | `/api/order/PAID-order` | User | Same as COD | Pending grouped order plus `checkoutUrl`; same validation errors |
| POST | `/api/order/web-hook` | Stripe signature | Raw Stripe payload | Idempotent `200`; `INVALID_WEBHOOK_SIGNATURE` |
| GET | `/api/order/get-orders?page=1&limit=20` | User | Query pagination | User-owned grouped orders |
| GET | `/api/order/:orderId` | User | Public order ID | User-owned order only; `ORDER_NOT_FOUND` |
| GET | `/api/admin/upcoming-orders` | Admin | `search`, `status`, `paymentStatus`, `orderType`, `from`, `to`, `table`, pagination | Grouped restaurant orders |
| POST | `/api/admin/manage-order` | Admin | `orderId`, normalized `action`, optional `note` | Validated transition; `INVALID_STATUS_TRANSITION` |
| POST | `/api/admin/orders/:orderId/refund` | Admin | Public order ID | Idempotent Stripe refund followed by cancellation; `ORDER_NOT_REFUNDABLE` |

Supported order types: `DINE_IN`, `DELIVERY`, `TAKEAWAY`. Order statuses: `PLACED`, `CONFIRMED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`. Payment statuses: `PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`.

## Tables and QR

| Method | Endpoint | Auth | Request / result |
| --- | --- | --- | --- |
| GET | `/api/tables/resolve/:publicId` | Public, rate limited | Returns only an active table in the configured restaurant |
| GET | `/api/admin/tables` | Admin | Lists durable tables |
| POST | `/api/admin/tables` | Admin | `{ "tableNumber": "12" }` |
| PATCH | `/api/admin/tables/:publicId` | Admin | `tableNumber` and/or `isActive` |
| DELETE | `/api/admin/tables/:publicId` | Admin | Deactivates; old QR stops accepting orders |

## Banners

| Method | Endpoint | Auth | Request / result |
| --- | --- | --- | --- |
| GET | `/api/banners/active` | Public | Scheduled active slides, sorted by display order |
| GET | `/api/admin/banners` | Admin | All slides |
| POST | `/api/admin/banners` | Admin | Title, media URL, alt text, optional mobile/CTA/schedule/timing |
| PATCH | `/api/admin/banners/:id` | Admin | Partial banner update |
| DELETE | `/api/admin/banners/:id` | Admin | Deletes record and managed Cloudinary media |
| PATCH | `/api/admin/banners/reorder` | Admin | `{ "order": ["bannerId", "..."] }` |
| PATCH | `/api/admin/banners/:id/status` | Admin | `{ "isActive": false }` |

Upload media first with `POST /api/file/upload` as an admin multipart request with field `image`. JPEG, PNG, WebP, and GIF up to `MAX_UPLOAD_BYTES` are accepted.

## Inventory

| Method | Endpoint | Auth | Request / result |
| --- | --- | --- | --- |
| GET | `/api/admin/inventory` | Admin | Paginated product stock |
| POST | `/api/admin/inventory/:productId/adjust` | Admin | Integer `delta` and required `reason`; cannot make stock negative |

Authentication, cart, address, category, subcategory, and product paths retain their existing public paths. Cart quantity updates now require ownership, a positive integer, and available stock.
