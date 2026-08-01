const test = require('node:test')
const assert = require('node:assert/strict')
const stripe = require('stripe')('sk_test_scanmymeal_unit_test')

test('Stripe webhook signatures reject tampering', () => {
  const payload = JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed' })
  const secret = 'whsec_scanmymeal_test'
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret })
  assert.equal(stripe.webhooks.constructEvent(payload, header, secret).id, 'evt_test')
  assert.throws(() => stripe.webhooks.constructEvent(`${payload}x`, header, secret), /signature/i)
})
