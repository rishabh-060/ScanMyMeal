# Order migration and rollback

## Why old orders are not grouped

Historical documents contain one item per order and do not contain a reliable checkout/parent reference. Merging by customer and timestamp could combine unrelated purchases. The migration therefore marks them as schema version 1 and preserves one historical card per original record. New checkouts are schema version 2 immediately.

## Procedure

1. Take a MongoDB snapshot/backup.
2. Deploy code while keeping old API routes available.
3. Run a dry scan: `npm run migrate:orders`.
4. Review the reported legacy count.
5. Apply: `npm run migrate:orders -- --apply`.
6. Run `npm test`, open old/new user history, and compare counts/totals.

The script is idempotent. It only adds `schemaVersion`, `publicOrderId` (copied from the already unique `orderId`), and a normalized display status. It does not remove old fields or rewrite financial values.

## Rollback

Application rollback does not require removing the added fields because old code ignores them. If field rollback is mandated, restore the pre-migration backup; do not run a broad `$unset` without verifying no schema-v2 orders exist. Stock/order changes must never be rolled back by deleting order documents.
