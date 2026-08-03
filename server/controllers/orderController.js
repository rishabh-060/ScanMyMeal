const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const { Stripe } = require('../config/stripe')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { createOrder, getIdempotencyKey, previewOrderPricing } = require('../services/orderService')
const { initiateStripeCheckout, processStripeEvent } = require('../services/paymentService')
const { PAYMENT_METHODS } = require('../constants/order')

const serializeOrder = (order) => {
  const value = order.toObject ? order.toObject() : order
  delete value.idempotencyKey
  delete value.guestSessionId
  if (value.payment) delete value.payment.processedEventIds
  return value
}

const CashOnDeliveryController = asyncHandler(async (req, res) => {
  const idempotencyKey = getIdempotencyKey(req)
  const { order, replayed } = await createOrder({
    userId: req.userId,
    idempotencyKey,
    input: req.body,
    paymentMethod: PAYMENT_METHODS.CASH,
  })
  return res.status(replayed ? 200 : 201).json({
    success: true,
    error: false,
    message: replayed ? 'Existing order returned' : 'Order placed successfully',
    data: serializeOrder(order),
    replayed,
  })
})

const CardPaymentController = asyncHandler(async (req, res) => {
  const idempotencyKey = getIdempotencyKey(req)
  const user = await userModel.findById(req.userId).select('name email')
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  const result = await initiateStripeCheckout({ user, idempotencyKey, input: req.body })
  return res.status(result.replayed ? 200 : 201).json({
    success: true,
    error: false,
    message: 'Payment session ready',
    id: result.session.id,
    url: result.session.url,
    data: {
      sessionId: result.session.id,
      checkoutUrl: result.session.url,
      order: serializeOrder(result.order),
    },
    replayed: result.replayed,
  })
})

const validateOfferController = asyncHandler(async (req, res) => {
  const data = await previewOrderPricing({ userId: req.userId, offerCode: req.body.offerCode })
  return res.json({
    success: true,
    error: false,
    message: `${data.offer.code} applied successfully`,
    data,
  })
})

const webHookStripe = asyncHandler(async (req, res) => {
  const signature = req.get('stripe-signature')
  const secret = process.env.STRIPE_ENDPOINT_WEBHOOK_SECRET_KEY
  if (!secret) throw new AppError('Payment webhook secret is not configured', 500, 'CONFIGURATION_ERROR')
  let event
  try {
    event = Stripe.webhooks.constructEvent(req.body, signature, secret)
  } catch (_error) {
    throw new AppError('Invalid payment webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE')
  }
  const result = await processStripeEvent(event)
  return res.status(200).json({ success: true, received: true, replayed: Boolean(result.replayed) })
})

const getOrderProductsController = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10))
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit || '20', 10)))
  const [orders, total] = await Promise.all([
    orderModel.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('delivery_address', 'address_line city state country pincode mobile')
      .populate('table', 'publicId tableNumber')
      .lean(),
    orderModel.countDocuments({ userId: req.userId }),
  ])
  return res.status(200).json({
    success: true,
    error: false,
    message: orders.length ? 'Orders fetched successfully' : 'No orders found',
    data: orders.map(serializeOrder),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

const getOrderDetailsController = asyncHandler(async (req, res) => {
  const order = await orderModel.findOne({
    userId: req.userId,
    $or: [{ publicOrderId: req.params.orderId }, { orderId: req.params.orderId }],
  }).populate('delivery_address', 'address_line city state country pincode mobile')
    .populate('table', 'publicId tableNumber')
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
  return res.json({ success: true, error: false, data: serializeOrder(order) })
})

module.exports = {
  CashOnDeliveryController,
  CardPaymentController,
  validateOfferController,
  webHookStripe,
  getOrderProductsController,
  getOrderDetailsController,
}
