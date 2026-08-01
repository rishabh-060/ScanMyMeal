const test = require('node:test')
const assert = require('node:assert/strict')
const { calculatePricing, discountedUnitPrice } = require('../services/pricingService')

test('discountedUnitPrice validates and rounds currency', () => {
  assert.equal(discountedUnitPrice(199, 10), 179.1)
  assert.throws(() => discountedUnitPrice(10, 101), /discount/i)
})

test('calculatePricing groups totals from server product snapshots', () => {
  const result = calculatePricing([
    { product: { _id: 'p1', name: 'Burger', image: [], price: 150, discount: 10 }, quantity: 2 },
    { product: { _id: 'p2', name: 'Coffee', image: [], price: 120, discount: 0 }, quantity: 1 },
  ], { taxRate: 5, serviceCharge: 10, deliveryCharge: 20 })
  assert.equal(result.items.length, 2)
  assert.equal(result.pricing.subtotal, 420)
  assert.equal(result.pricing.discount, 30)
  assert.equal(result.pricing.tax, 19.5)
  assert.equal(result.pricing.grandTotal, 439.5)
})
