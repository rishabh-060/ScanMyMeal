const { randomBytes } = require('crypto')
const mongoose = require('mongoose')
const addressModel = require('../models/addressModel')
const cartModel = require('../models/cartModel')
const inventoryAdjustmentModel = require('../models/inventoryAdjustmentModel')
const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel')
const tableModel = require('../models/tableModel')
const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const logger = require('../utils/logger')
const cache = require('./cacheService')
const { calculatePricing } = require('./pricingService')
const { resolveOffer, applyOffer, redeemOffer, releaseOfferRedemption } = require('./offerService')
const { publishNotification } = require('./notificationService')
const {
  ORDER_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  STATUS_TRANSITIONS,
} = require('../constants/order')

const DEFAULT_RESTAURANT_ID = 'default'
const INVENTORY_RESERVATION_TTL_SECONDS = 1800

const withSession = (session) => (session ? { session } : {})

const createPublicOrderId = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `SMM-${date}-${randomBytes(4).toString('hex').toUpperCase()}`
}

const normalizeOrderType = (value) => {
  const orderType = String(value || ORDER_TYPES.DELIVERY).toUpperCase()
  if (!Object.values(ORDER_TYPES).includes(orderType)) {
    throw new AppError('Invalid order type', 400, 'INVALID_ORDER_TYPE')
  }
  return orderType
}

const runInTransaction = async (work) => {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => { result = await work(session) })
    return result
  } catch (error) {
    const transactionsUnsupported = error?.code === 20 || /Transaction numbers are only allowed/.test(error?.message || '')
    if (!transactionsUnsupported) throw error
    logger.warn('mongodb_transactions_unavailable', { message: error.message })
    return work(null)
  } finally {
    await session.endSession()
  }
}

const getIdempotencyKey = (req) => {
  const key = req.get('idempotency-key') || req.body?.idempotencyKey
  if (!key || String(key).length < 8 || String(key).length > 160) {
    throw new AppError('A valid Idempotency-Key header is required', 400, 'IDEMPOTENCY_KEY_REQUIRED')
  }
  return `${req.userId}:${String(key)}`
}

const loadCheckoutItems = async (userId, session) => {
  let query = cartModel.find({ userId }).populate('product')
  if (session) query = query.session(session)
  const cartItems = await query
  if (!cartItems.length) throw new AppError('Your cart is empty', 400, 'EMPTY_CART')

  return cartItems.map((cartItem) => {
    if (!cartItem.product || !cartItem.product.publish || cartItem.product.isAvailable === false) {
      throw new AppError('Some cart items are unavailable', 409, 'PRODUCT_UNAVAILABLE')
    }
    if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
      throw new AppError('Cart contains an invalid quantity', 400, 'INVALID_QUANTITY')
    }
    return { product: cartItem.product, quantity: cartItem.quantity }
  })
}

const resolveFulfilment = async ({ userId, orderType, tablePublicId, addressId, session }) => {
  const restaurant = DEFAULT_RESTAURANT_ID
  if (orderType === ORDER_TYPES.DINE_IN) {
    let query = tableModel.findOne({ publicId: tablePublicId, restaurant, isActive: true })
    if (session) query = query.session(session)
    const table = await query
    if (!table) throw new AppError('Table link is invalid or inactive', 404, 'INVALID_TABLE')
    return { restaurant, table, address: null }
  }

  if (orderType === ORDER_TYPES.DELIVERY) {
    let query = addressModel.findOne({ _id: addressId, userId, status: true })
    if (session) query = query.session(session)
    const address = await query
    if (!address) throw new AppError('Delivery address was not found', 404, 'ADDRESS_NOT_FOUND')
    return { restaurant, table: null, address }
  }

  return { restaurant, table: null, address: null }
}

const decrementInventory = async (items, orderId, session) => {
  const decremented = []
  try {
    for (const item of items) {
      const product = await productModel.findOneAndUpdate(
        { _id: item.product._id, publish: true, isAvailable: { $ne: false }, stock: { $gte: item.quantity } },
        [
          { $set: { stock: { $subtract: ['$stock', item.quantity] } } },
          { $set: { isAvailable: { $gt: ['$stock', 0] } } },
        ],
        { new: true, ...withSession(session) },
      )
      if (!product) {
        throw new AppError(`${item.product.name} does not have enough stock`, 409, 'INSUFFICIENT_STOCK', [
          { productId: String(item.product._id), requested: item.quantity },
        ])
      }
      decremented.push(item)
    }
    return decremented
  } catch (error) {
    if (!session) {
      await Promise.all(decremented.map((item) => productModel.updateOne(
        { _id: item.product._id },
        { $inc: { stock: item.quantity }, $set: { isAvailable: true } },
      )))
    }
    throw error
  }
}

const clearCart = async (userId, session) => {
  await Promise.all([
    cartModel.softDeleteMany({ userId }, { deletedBy: userId, session }),
    userModel.updateOne({ _id: userId }, { $set: { shopping_cart: [] } }, withSession(session)),
  ])
}

const previewOrderPricing = async ({ userId, offerCode }) => {
  const items = await loadCheckoutItems(userId)
  const calculated = calculatePricing(items, { deliveryCharge: 0, serviceCharge: 0 })
  const resolvedOffer = await resolveOffer(offerCode, calculated.pricing)
  calculated.pricing = applyOffer(calculated.pricing, resolvedOffer)
  return {
    pricing: calculated.pricing,
    offer: resolvedOffer ? {
      code: resolvedOffer.offer.code,
      name: resolvedOffer.offer.name,
      type: resolvedOffer.offer.type,
      value: resolvedOffer.offer.value,
      discount: resolvedOffer.discount,
    } : null,
  }
}

const createOrder = async ({ userId, idempotencyKey, input, paymentMethod }) => {
  const existing = await orderModel.findOne({ idempotencyKey })
  if (existing) return { order: existing, replayed: true }

  const orderType = normalizeOrderType(input.orderType)
  const inventoryState = paymentMethod === PAYMENT_METHODS.ONLINE ? 'RESERVED' : 'COMMITTED'
  const paymentStatus = PAYMENT_STATUSES.PENDING
  const publicOrderId = createPublicOrderId()
  let fallbackDecrements = []
  let fallbackOfferId = null

  try {
    const order = await runInTransaction(async (session) => {
      const items = await loadCheckoutItems(userId, session)
      const fulfilment = await resolveFulfilment({
        userId,
        orderType,
        tablePublicId: input.tableId,
        addressId: input.addressId,
        session,
      })
      const deliveryCharge = 0
      const serviceCharge = 0
      const calculated = calculatePricing(items, { deliveryCharge, serviceCharge })
      const resolvedOffer = await resolveOffer(input.offerCode, calculated.pricing, session)
      calculated.pricing = applyOffer(calculated.pricing, resolvedOffer)
      await decrementInventory(items, publicOrderId, session)
      if (!session) fallbackDecrements = items
      if (resolvedOffer) {
        await redeemOffer(resolvedOffer.offer, session)
        if (!session) fallbackOfferId = resolvedOffer.offer._id
      }

      const address = fulfilment.address
      const payload = {
        publicOrderId,
        orderId: publicOrderId,
        idempotencyKey,
        userId,
        restaurant: fulfilment.restaurant,
        table: fulfilment.table?._id || null,
        table_num: fulfilment.table?._id || null,
        orderType,
        items: calculated.items,
        pricing: calculated.pricing,
        offer: resolvedOffer ? {
          offerId: resolvedOffer.offer._id,
          code: resolvedOffer.offer.code,
          name: resolvedOffer.offer.name,
          type: resolvedOffer.offer.type,
          value: resolvedOffer.offer.value,
          discount: resolvedOffer.discount,
        } : undefined,
        payment: { method: paymentMethod, status: paymentStatus, provider: paymentMethod === PAYMENT_METHODS.ONLINE ? 'STRIPE' : '' },
        inventory: { state: inventoryState, updatedAt: new Date() },
        status: ORDER_STATUSES.PLACED,
        statusHistory: [{ status: ORDER_STATUSES.PLACED, changedBy: userId, source: 'CUSTOMER_APP' }],
        delivery_address: address?._id || null,
        deliveryAddress: address ? {
          phone: String(address.mobile || ''),
          addressLine: address.address_line,
          city: address.city,
          state: address.state,
          postalCode: address.pincode,
          country: address.country,
        } : undefined,
        pickupTime: input.pickupTime || null,
        pickupInstructions: input.pickupInstructions || '',
        customerInstructions: input.customerInstructions || '',
        expiresAt: paymentMethod === PAYMENT_METHODS.ONLINE
          ? new Date(Date.now() + INVENTORY_RESERVATION_TTL_SECONDS * 1000)
          : null,
        order_status: ORDER_STATUSES.PLACED.toLowerCase(),
        payment_status: paymentStatus,
        subTotalAmt: calculated.pricing.subtotal,
        totalAmt: calculated.pricing.grandTotal,
      }
      const [created] = await orderModel.create([payload], withSession(session))
      fallbackDecrements = []
      try {
        await inventoryAdjustmentModel.insertMany(calculated.items.map((item) => ({
          product: item.product,
          order: created._id,
          delta: -item.quantity,
          reason: inventoryState === 'RESERVED' ? 'Online payment reservation' : 'Order placed',
          source: 'ORDER',
        })), withSession(session))
        await clearCart(userId, session)
      } catch (postCreateError) {
        if (session) throw postCreateError
        logger.error('post_order_cleanup_failed', { publicOrderId, error: postCreateError.message })
      }
      return created
    })

    fallbackOfferId = null
    await cache.removeByPattern('menu:*')
    await publishNotification({
      title: `New ${orderType.toLowerCase().replace('_', ' ')} order`,
      message: `${publicOrderId} has been placed for ₹${order.pricing.grandTotal}.`,
      type: 'INFO',
      audience: 'STAFF',
      actionUrl: '/admin/upcoming-orders',
      createdBy: userId,
    })
    if (inventoryState === 'RESERVED') {
      await cache.setJson(
        `inventory:reservation:${publicOrderId}`,
        { orderId: publicOrderId },
        INVENTORY_RESERVATION_TTL_SECONDS,
      )
    }
    logger.info('order_created', { publicOrderId, userId, orderType, inventoryState })
    return { order, replayed: false }
  } catch (error) {
    if (fallbackDecrements.length) {
      await Promise.allSettled(fallbackDecrements.map((item) => productModel.updateOne(
        { _id: item.product._id },
        { $inc: { stock: item.quantity }, $set: { isAvailable: true } },
      )))
      fallbackDecrements = []
    }
    if (fallbackOfferId) {
      await releaseOfferRedemption(fallbackOfferId)
      fallbackOfferId = null
    }
    if (error?.code === 11000) {
      const replay = await orderModel.findOne({ idempotencyKey })
      if (replay) return { order: replay, replayed: true }
    }
    throw error
  }
}

const restoreInventory = async (order, reason, source, session) => {
  if (!['RESERVED', 'COMMITTED'].includes(order.inventory?.state)) return false
  for (const item of order.items) {
    await productModel.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity }, $set: { isAvailable: true } },
      withSession(session),
    )
  }
  await inventoryAdjustmentModel.insertMany(order.items.map((item) => ({
    product: item.product,
    order: order._id,
    delta: item.quantity,
    reason,
    source,
  })), withSession(session))
  await cache.removeByPattern('menu:*')
  order.inventory = { state: 'RELEASED', updatedAt: new Date() }
  return true
}

const transitionOrder = async ({ publicOrderId, nextStatus, changedBy, source = 'ADMIN_PORTAL', note = '' }) => {
  const normalizedStatus = String(nextStatus || '').toUpperCase()
  if (!Object.values(ORDER_STATUSES).includes(normalizedStatus)) {
    throw new AppError('Invalid order status', 400, 'INVALID_ORDER_STATUS')
  }

  return runInTransaction(async (session) => {
    let query = orderModel.findOne({ $or: [{ publicOrderId }, { orderId: publicOrderId }] })
    if (session) query = query.session(session)
    const order = await query
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
    const allowed = STATUS_TRANSITIONS[order.status] || []
    if (!allowed.includes(normalizedStatus)) {
      throw new AppError(`Order cannot move from ${order.status} to ${normalizedStatus}`, 409, 'INVALID_STATUS_TRANSITION')
    }
    if (normalizedStatus === ORDER_STATUSES.CONFIRMED &&
        order.payment.method === PAYMENT_METHODS.ONLINE &&
        order.payment.status !== PAYMENT_STATUSES.PAID) {
      throw new AppError('Online payment has not been confirmed', 409, 'PAYMENT_NOT_CONFIRMED')
    }
    if (normalizedStatus === ORDER_STATUSES.CANCELLED) {
      if (order.payment.method === PAYMENT_METHODS.ONLINE && order.payment.status === PAYMENT_STATUSES.PAID) {
        throw new AppError('Paid online orders must be refunded before cancellation', 409, 'REFUND_REQUIRED')
      }
      await restoreInventory(order, 'Order cancelled', 'CANCELLATION', session)
      if (order.payment.status === PAYMENT_STATUSES.PENDING) order.payment.status = PAYMENT_STATUSES.CANCELLED
    }
    order.status = normalizedStatus
    order.order_status = normalizedStatus.toLowerCase()
    order.statusHistory.push({ status: normalizedStatus, changedBy, source, note })
    await order.save(withSession(session))
    logger.info('order_status_changed', { publicOrderId: order.publicOrderId, nextStatus: normalizedStatus, changedBy })
    return order
  })
}

const releasePaymentReservation = async ({ order, paymentStatus, eventId, reason }) => runInTransaction(async (session) => {
  let query = orderModel.findById(order._id)
  if (session) query = query.session(session)
  const current = await query.select('+payment.processedEventIds')
  if (current.payment.processedEventIds.includes(eventId)) return current
  if (current.payment.status !== PAYMENT_STATUSES.PENDING || current.inventory.state !== 'RESERVED') {
    current.payment.processedEventIds.push(eventId)
    await current.save(withSession(session))
    return current
  }
  await restoreInventory(current, reason, 'PAYMENT_EXPIRY', session)
  current.payment.status = paymentStatus
  current.payment.processedEventIds.push(eventId)
  current.status = ORDER_STATUSES.CANCELLED
  current.order_status = 'cancelled'
  current.payment_status = paymentStatus
  current.statusHistory.push({ status: ORDER_STATUSES.CANCELLED, source: 'PAYMENT_WEBHOOK', note: reason })
  await current.save(withSession(session))
  await cache.remove(`inventory:reservation:${current.publicOrderId}`)
  return current
})

const releaseExpiredReservations = async () => {
  const expired = await orderModel.find({
    'inventory.state': 'RESERVED',
    'payment.status': PAYMENT_STATUSES.PENDING,
    expiresAt: { $lte: new Date() },
  }).limit(100)
  for (const order of expired) {
    await releasePaymentReservation({
      order,
      paymentStatus: PAYMENT_STATUSES.CANCELLED,
      eventId: `expiry:${order._id}`,
      reason: 'Payment reservation expired',
    })
  }
  return expired.length
}

module.exports = {
  createOrder,
  previewOrderPricing,
  getIdempotencyKey,
  transitionOrder,
  restoreInventory,
  releasePaymentReservation,
  releaseExpiredReservations,
  normalizeOrderType,
}
