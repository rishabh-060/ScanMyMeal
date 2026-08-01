# Redis usage

Redis is optional for non-critical acceleration. MongoDB is the source of truth for orders, inventory, idempotency, and payment event state.

| Key pattern (after namespace) | Purpose | TTL | Invalidation / fallback |
| --- | --- | --- | --- |
| `homepage:banners:active` | Active homepage carousel | `BANNER_CACHE_TTL_SECONDS` (300 default) | Deleted on banner create/update/delete/reorder/status. Reads filter schedule again. Database fallback. |
| `menu:{restaurantId}:category:{categoryId}` | Active category menu | `MENU_CACHE_TTL_SECONDS` (180 default) | `menu:*` invalidated on product/category/subcategory/inventory mutation. Database fallback. |
| `rate-limit:{scope}:{identity}` | Login, OTP, QR, and order throttles | Middleware window | Redis counter; bounded in-process counter fallback. |
| `inventory:reservation:{publicOrderId}` | Short-lived online-payment reservation signal | `INVENTORY_RESERVATION_TTL_SECONDS` (1800 default) | Removed on paid/failed/expired events. MongoDB `expiresAt` sweep performs durable release. |

The configured prefix (`REDIS_KEY_PREFIX`, `scanmymeal` by default) is prepended to every key. The client uses retry backoff, logs failures without secrets, and never crashes the ordering API because a cache is unavailable. Critical idempotency uses MongoDB unique indexes, not Redis-only locks.
