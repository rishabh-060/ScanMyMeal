const test = require('node:test')
const assert = require('node:assert/strict')
const productModel = require('../models/productModel')
const adjustmentModel = require('../models/inventoryAdjustmentModel')
const cache = require('../services/cacheService')
const { restoreInventory } = require('../services/orderService')

test('inventory restoration increments every grouped order item once per call', { concurrency: false }, async () => {
  const originalUpdate = productModel.updateOne
  const originalInsertMany = adjustmentModel.insertMany
  const originalRemoveByPattern = cache.removeByPattern
  const updates = []
  const invalidatedPatterns = []
  productModel.updateOne = async (...args) => { updates.push(args); return { modifiedCount: 1 } }
  adjustmentModel.insertMany = async (entries) => entries
  cache.removeByPattern = async (pattern) => { invalidatedPatterns.push(pattern); return true }
  try {
    const order = {
      _id: 'order-1',
      inventory: { state: 'COMMITTED' },
      items: [{ product: 'p1', quantity: 2 }, { product: 'p2', quantity: 1 }],
    }
    assert.equal(await restoreInventory(order, 'Cancelled', 'CANCELLATION', null), true)
    assert.equal(updates.length, 2)
    assert.equal(updates[0][1].$inc.stock, 2)
    assert.equal(order.inventory.state, 'RELEASED')
    assert.deepEqual(invalidatedPatterns, ['menu:*'])
    assert.equal(await restoreInventory(order, 'Cancelled', 'CANCELLATION', null), false)
    assert.equal(updates.length, 2)
    assert.deepEqual(invalidatedPatterns, ['menu:*'])
  } finally {
    productModel.updateOne = originalUpdate
    adjustmentModel.insertMany = originalInsertMany
    cache.removeByPattern = originalRemoveByPattern
  }
})
