# Test report

## Automated coverage added

- Server pricing, discounts, tax, fees, and rounding.
- Order type and centralized status-transition rules.
- Per-user idempotency-key scoping.
- Grouped inventory restoration and duplicate-release protection.
- Banner activation scheduling.
- Stripe signature verification and tamper rejection.
- Source syntax checking for all server JavaScript files.

## Latest results

- Server source check: 68 files passed.
- Server unit tests: 8 passed, 0 failed.
- Next.js production build: passed under `NODE_ENV=production`; all 30 routes generated/validated.
- App module startup smoke test: passed (Express app loaded without opening a port).
- Server `npm audit` after runtime/dev dependency upgrades: 0 vulnerabilities.
- Frontend `npm audit` after the Next.js/Axios upgrade and patched PostCSS/Sharp overrides: 0 vulnerabilities.

## Manual staging scenarios still required

Use real isolated Stripe, Cloudinary, SMTP, Redis, and MongoDB replica-set credentials to check valid/disabled QR scans, concurrent last-stock orders, successful/failed/expired Stripe sessions, duplicate webhook delivery, image/GIF lifecycle, cache invalidation, Redis outage, responsive/mobile checkout, keyboard/focus behavior, and production CORS/cookies. These cannot be truthfully certified without the deployment environment.
