const orderModel = require('../models/orderModel')
const { Stripe } = require('../config/stripe')
const AppError = require('../utils/AppError')
const logger = require('../utils/logger')
const cache = require('./cacheService')
const { createOrder, releasePaymentReservation } = require('./orderService')
const { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } = require('../constants/order')

const buildLineItems = (order) => {
  if (order.pricing.offerDiscount > 0) {
    return [{
      price_data: {
        currency: 'inr',
        product_data: { name: `Scan My Meal order · ${order.pricing.offerCode}` },
        unit_amount: Math.round(order.pricing.grandTotal * 100),
      },
      quantity: 1,
    }]
  }
  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'inr',
      product_data: { name: item.nameSnapshot, images: item.imageSnapshot.slice(0, 8) },
      unit_amount: Math.round((item.subtotal / item.quantity) * 100),
    },
    quantity: item.quantity,
  }))
  const charges = [
    ['Tax', order.pricing.tax],
    ['Service charge', order.pricing.serviceCharge],
    ['Delivery charge', order.pricing.deliveryCharge],
  ]
  for (const [name, amount] of charges) {
    if (amount > 0) {
      lineItems.push({
        price_data: { currency: 'inr', product_data: { name }, unit_amount: Math.round(amount * 100) },
        quantity: 1,
      })
    }
  }
  return lineItems
}

const initiateStripeCheckout = async ({ user, idempotencyKey, input }) => {
  const { order, replayed } = await createOrder({
    userId: user._id,
    idempotencyKey,
    input,
    paymentMethod: PAYMENT_METHODS.ONLINE,
  })
  if (order.payment.providerOrderId && order.payment.status === PAYMENT_STATUSES.PENDING) {
    const session = await Stripe.checkout.sessions.retrieve(order.payment.providerOrderId)
    return { order, session, replayed: true }
  }

  try {
    const clientUrl = process.env.FRONTEND_URL
    if (!clientUrl) throw new AppError('FRONTEND_URL is not configured', 500, 'CONFIGURATION_ERROR')
    const session = await Stripe.checkout.sessions.create({
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      metadata: { publicOrderId: order.publicOrderId, userId: String(user._id) },
      line_items: buildLineItems(order),
      success_url: `${clientUrl}/success?orderId=${encodeURIComponent(order.publicOrderId)}`,
      cancel_url: `${clientUrl}/cancel?orderId=${encodeURIComponent(order.publicOrderId)}`,
      expires_at: Math.floor(order.expiresAt.getTime() / 1000),
    }, { idempotencyKey })
    order.payment.providerOrderId = session.id
    order.payment_status = PAYMENT_STATUSES.PENDING
    await order.save()
    logger.info('payment_initialized', { publicOrderId: order.publicOrderId, providerOrderId: session.id })
    return { order, session, replayed }
  } catch (error) {
    await releasePaymentReservation({
      order,
      paymentStatus: PAYMENT_STATUSES.FAILED,
      eventId: `initialization-failed:${order._id}`,
      reason: 'Payment initialization failed',
    })
    throw error
  }
}

const findWebhookOrder = async (session) => {
  const publicOrderId = session.metadata?.publicOrderId
  const order = await orderModel.findOne({
    $or: [
      { publicOrderId },
      { 'payment.providerOrderId': session.id },
    ],
  }).select('+payment.processedEventIds')
  if (!order) throw new AppError('Payment order not found', 404, 'PAYMENT_ORDER_NOT_FOUND')
  return order
}

const processStripeEvent = async (event) => {
  const session = event.data.object
  if (!['checkout.session.completed', 'checkout.session.expired', 'checkout.session.async_payment_failed'].includes(event.type)) {
    return { ignored: true }
  }
  const order = await findWebhookOrder(session)
  if (order.payment.processedEventIds.includes(event.id)) return { order, replayed: true }

  if (event.type === 'checkout.session.completed') {
    const updated = await orderModel.findOneAndUpdate(
      {
        _id: order._id,
        'payment.processedEventIds': { $ne: event.id },
        'payment.status': PAYMENT_STATUSES.PENDING,
        'inventory.state': 'RESERVED',
      },
      {
        $set: {
          'payment.status': PAYMENT_STATUSES.PAID,
          'payment.providerPaymentId': String(session.payment_intent || ''),
          'payment.transactionReference': String(session.payment_intent || session.id),
          'inventory.state': 'COMMITTED',
          'inventory.updatedAt': new Date(),
          status: ORDER_STATUSES.CONFIRMED,
          order_status: 'confirmed',
          payment_status: PAYMENT_STATUSES.PAID,
        },
        $push: {
          'payment.processedEventIds': event.id,
          statusHistory: {
            status: ORDER_STATUSES.CONFIRMED,
            source: 'PAYMENT_WEBHOOK',
            changedAt: new Date(),
            note: 'Stripe payment confirmed',
          },
        },
      },
      { new: true },
    )
    await cache.remove(`inventory:reservation:${order.publicOrderId}`)
    logger.info('payment_confirmed', { publicOrderId: order.publicOrderId, eventId: event.id })
    if (!updated) {
      const current = await orderModel.findById(order._id)
      return { order: current, replayed: true }
    }
    return { order: updated, replayed: false }
  }

  const paymentStatus = event.type === 'checkout.session.expired'
    ? PAYMENT_STATUSES.CANCELLED
    : PAYMENT_STATUSES.FAILED
  const updated = await releasePaymentReservation({
    order,
    paymentStatus,
    eventId: event.id,
    reason: event.type === 'checkout.session.expired' ? 'Payment session expired' : 'Payment failed',
  })
  logger.info('payment_reservation_released', { publicOrderId: order.publicOrderId, eventId: event.id, paymentStatus })
  return { order: updated, replayed: false }
}

module.exports = { initiateStripeCheckout, processStripeEvent, buildLineItems }
