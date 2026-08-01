const test = require('node:test')
const assert = require('node:assert/strict')
const { STATUS_TRANSITIONS } = require('../constants/order')
const { normalizeOrderType, getIdempotencyKey } = require('../services/orderService')

test('terminal order states cannot transition', () => {
  assert.deepEqual(STATUS_TRANSITIONS.CANCELLED, [])
  assert.deepEqual(STATUS_TRANSITIONS.COMPLETED, [])
  assert.ok(STATUS_TRANSITIONS.PLACED.includes('CONFIRMED'))
})

test('order type validation normalizes known values', () => {
  assert.equal(normalizeOrderType('dine_in'), 'DINE_IN')
  assert.throws(() => normalizeOrderType('CURBSIDE'), /order type/i)
})

test('idempotency keys are scoped to the authenticated user', () => {
  const req = { userId: 'user-1', body: {}, get: (name) => name === 'idempotency-key' ? 'checkout-123' : undefined }
  assert.equal(getIdempotencyKey(req), 'user-1:checkout-123')
})
