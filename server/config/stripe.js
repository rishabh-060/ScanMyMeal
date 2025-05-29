// This is your test secret API key.
const stripe = require('stripe')

const Stripe = stripe(process.env.STRIPE_SECRET_KEY)

module.exports = { Stripe }