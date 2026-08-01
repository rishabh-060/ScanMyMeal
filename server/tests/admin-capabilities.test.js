const test = require('node:test')
const assert = require('node:assert/strict')
const { hasPermission, permissionsFor } = require('../constants/permissions')
const { applyOffer } = require('../services/offerService')

test('role permissions combine role defaults with explicit grants', () => {
  assert.equal(hasPermission({ role: 'ADMIN' }, 'access.manage'), true)
  assert.equal(hasPermission({ role: 'KITCHEN' }, 'orders.manage'), true)
  assert.equal(hasPermission({ role: 'KITCHEN' }, 'offers.manage'), false)
  assert.equal(hasPermission({ role: 'KITCHEN', permissions: ['offers.view'] }, 'offers.view'), true)
  assert.equal(new Set(permissionsFor({ role: 'KITCHEN', permissions: ['orders.view'] })).size, permissionsFor({ role: 'KITCHEN', permissions: ['orders.view'] }).length)
})

test('offer discounts reduce the final total without changing base pricing', () => {
  const pricing = { subtotal: 500, discount: 50, tax: 22.5, serviceCharge: 0, deliveryCharge: 30, grandTotal: 502.5 }
  const result = applyOffer(pricing, { offer: { code: 'SAVE20' }, discount: 90 })
  assert.equal(result.offerCode, 'SAVE20')
  assert.equal(result.offerDiscount, 90)
  assert.equal(result.grandTotal, 412.5)
  assert.equal(pricing.grandTotal, 502.5)
})
