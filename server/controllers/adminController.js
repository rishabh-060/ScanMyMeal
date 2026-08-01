const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const offerModel = require('../models/offerModel')
const notificationModel = require('../models/notificationModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { transitionOrder } = require('../services/orderService')
const { getOrderReport, getReportRange, getTopCustomers } = require('../services/reportService')
const sendMail = require('../helpers/tryMailer')
const accountSuspention = require('../templates/accountSuspention')
const { Stripe } = require('../config/stripe')
const { PAYMENT_STATUSES } = require('../constants/order')

const getDashboardSummaryController = asyncHandler(async (req, res) => {
  const restaurant = { restaurant: { $in: [process.env.DEFAULT_RESTAURANT_ID || 'default', null] } }
  const now = new Date()
  const todayRange = getReportRange({ period: 'day', from: req.query.from, to: req.query.to })
  const [customers, products, orders, activeOffers, unreadNotifications, lowStock, revenue, todayReport, topCustomers] = await Promise.all([
    userModel.countDocuments({ role: 'USER' }),
    productModel.countDocuments(),
    orderModel.countDocuments(restaurant),
    offerModel.countDocuments({ isActive: true, $or: [{ startAt: null }, { startAt: { $lte: now } }], $and: [{ $or: [{ endAt: null }, { endAt: { $gt: now } }] }] }),
    notificationModel.countDocuments({ audience: { $in: ['STAFF', 'ALL'] }, readBy: { $ne: req.userId }, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }),
    productModel.find({ stock: { $lte: 5 }, publish: true }).select('name image stock isAvailable').sort({ stock: 1 }).limit(5).lean(),
    orderModel.aggregate([{ $match: restaurant }, { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }]),
    getOrderReport({ period: 'day', from: todayRange.from, to: todayRange.to, timezone: req.query.timezone }),
    getTopCustomers({ from: todayRange.from, to: todayRange.to, limit: 5 }),
  ])
  return res.json({
    success: true,
    error: false,
    data: {
      customers,
      products,
      orders,
      activeOffers,
      unreadNotifications,
      lowStock,
      revenue: revenue[0]?.total || 0,
      todayRevenue: todayReport.summary.revenue,
      todayOrders: todayReport.summary.orderCount,
      todayItemsSold: todayReport.summary.itemsSold,
      todayAverageOrder: todayReport.summary.averageOrderValue,
      topProducts: todayReport.topProducts.slice(0, 5),
      topCustomers,
      todayRange: todayReport.range,
    },
  })
})

const getAllOrdersController = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10))
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || '25', 10)))
  const filters = [{ restaurant: { $in: [process.env.DEFAULT_RESTAURANT_ID || 'default', null] } }]
  const status = String(req.query.status || '').toUpperCase()
  if (status === 'LIVE') filters.push({ status: { $nin: ['COMPLETED', 'CANCELLED'] } })
  else if (status) filters.push({ status })
  if (req.query.paymentStatus) filters.push({ 'payment.status': String(req.query.paymentStatus).toUpperCase() })
  if (req.query.orderType) filters.push({ orderType: String(req.query.orderType).toUpperCase() })
  if (req.query.table) filters.push({ table: req.query.table })
  if (req.query.search) filters.push({ $or: [
    { publicOrderId: { $regex: String(req.query.search), $options: 'i' } },
    { orderId: { $regex: String(req.query.search), $options: 'i' } },
    { 'deliveryAddress.phone': { $regex: String(req.query.search), $options: 'i' } },
  ] })

  const requestedWindow = String(req.query.window || '24h').toLowerCase()
  const from = req.query.from ? new Date(req.query.from) : null
  const to = req.query.to ? new Date(req.query.to) : null
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
    throw new AppError('Invalid order date range', 400, 'INVALID_DATE_RANGE')
  }
  if (from || to) {
    const createdAt = {}
    if (from) createdAt.$gte = from
    if (to) createdAt.$lt = to
    filters.push({ createdAt })
  } else if (requestedWindow !== 'all') {
    const now = new Date()
    if (requestedWindow === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      filters.push({ createdAt: { $gte: start, $lte: now } })
    } else {
      const hours = requestedWindow === '12h' ? 12 : 24
      filters.push({ createdAt: { $gte: new Date(now.getTime() - hours * 60 * 60 * 1000), $lte: now } })
    }
  }
  const query = filters.length === 1 ? filters[0] : { $and: filters }
  const [orders, total] = await Promise.all([
    orderModel.find(query)
      .populate('userId', 'name email mobile')
      .populate('delivery_address')
      .populate('table', 'publicId tableNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    orderModel.countDocuments(query),
  ])
  return res.json({
    success: true,
    error: false,
    message: orders.length ? 'Orders fetched successfully' : 'No orders found',
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    filters: { window: requestedWindow, status: status || 'ALL' },
  })
})

const getOrderReportController = asyncHandler(async (req, res) => {
  const report = await getOrderReport({
    period: req.query.period,
    from: req.query.from,
    to: req.query.to,
    reference: req.query.reference,
    timezone: req.query.timezone,
  })
  return res.json({ success: true, error: false, message: 'Order report generated', data: report })
})

const getAllUsersController = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10))
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || '25', 10)))
  const query = req.query.search
    ? { $or: [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ] }
    : {}
  const [users, total] = await Promise.all([
    userModel.find(query).select('name avatar email mobile role permissions status createdAt last_login_date').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    userModel.countDocuments(query),
  ])
  return res.json({ success: true, error: false, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

const getAllProductsLengthController = asyncHandler(async (_req, res) => {
  const total = await productModel.countDocuments()
  return res.json({ success: true, error: false, message: 'Product count fetched', data: total })
})

const updateUserByEmail = async (email, updates) => {
  if (!email) throw new AppError('User email is required', 400, 'EMAIL_REQUIRED')
  const user = await userModel.findOneAndUpdate({ email: String(email).toLowerCase() }, { $set: updates }, { new: true })
    .select('name email role status')
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  return user
}

const convertToAdminController = asyncHandler(async (req, res) => {
  const user = await updateUserByEmail(req.body.userEmail, { role: 'ADMIN', permissions: [] })
  return res.json({ success: true, error: false, message: 'User role updated to ADMIN', data: user })
})

const convertToUserController = asyncHandler(async (req, res) => {
  const user = await updateUserByEmail(req.body.userEmail, { role: 'USER', permissions: [] })
  return res.json({ success: true, error: false, message: 'User role updated to USER', data: user })
})

const suspendUserController = asyncHandler(async (req, res) => {
  const user = await updateUserByEmail(req.body.userEmail, { status: 'Suspended' })
  void sendMail(
    user.email,
    'Suspension Notice | Scan My Meal',
    'Your account has been suspended',
    accountSuspention(user.name, new Date().toLocaleDateString(), 'Violation of terms and conditions'),
  )
  return res.json({ success: true, error: false, message: 'User suspended', data: user })
})

const activateUserController = asyncHandler(async (req, res) => {
  const user = await updateUserByEmail(req.body.userEmail, { status: 'Active' })
  return res.json({ success: true, error: false, message: 'User activated', data: user })
})

const manageUpcomingOrdersController = asyncHandler(async (req, res) => {
  const order = await transitionOrder({
    publicOrderId: req.body.orderId,
    nextStatus: req.body.action,
    changedBy: req.userId,
    source: 'ADMIN_PORTAL',
    note: req.body.note || '',
  })
  return res.json({ success: true, error: false, message: `Order status updated to ${order.status}`, data: order })
})

const refundOrderController = asyncHandler(async (req, res) => {
  const publicOrderId = req.params.orderId
  const order = await orderModel.findOne({ $or: [{ publicOrderId }, { orderId: publicOrderId }] })
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
  if (order.payment?.status === PAYMENT_STATUSES.REFUNDED) {
    return res.json({ success: true, error: false, message: 'Order was already refunded', data: order, replayed: true })
  }
  if (order.payment?.status !== PAYMENT_STATUSES.PAID || !order.payment.providerPaymentId) {
    throw new AppError('Only paid online orders can be refunded', 409, 'ORDER_NOT_REFUNDABLE')
  }
  const refund = await Stripe.refunds.create(
    { payment_intent: order.payment.providerPaymentId },
    { idempotencyKey: `refund:${order._id}` },
  )
  order.payment.status = PAYMENT_STATUSES.REFUNDED
  order.payment.transactionReference = refund.id
  order.payment_status = PAYMENT_STATUSES.REFUNDED
  await order.save()
  const cancelled = await transitionOrder({
    publicOrderId,
    nextStatus: 'CANCELLED',
    changedBy: req.userId,
    source: 'ADMIN_PORTAL',
    note: `Refund ${refund.id}`,
  })
  return res.json({ success: true, error: false, message: 'Payment refunded and order cancelled', data: cancelled })
})

module.exports = {
  getDashboardSummaryController,
  getAllOrdersController,
  getOrderReportController,
  getAllUsersController,
  convertToAdminController,
  convertToUserController,
  suspendUserController,
  activateUserController,
  getAllProductsLengthController,
  manageUpcomingOrdersController,
  refundOrderController,
}
