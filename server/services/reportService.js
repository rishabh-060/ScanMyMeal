const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')

const PERIODS = new Set(['day', 'week', 'month', 'year'])

const validDate = (value) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

const getReportRange = ({ period = 'day', from, to, reference } = {}) => {
  const normalizedPeriod = PERIODS.has(String(period).toLowerCase()) ? String(period).toLowerCase() : 'day'
  const explicitFrom = validDate(from)
  const explicitTo = validDate(to)
  if ((from && !explicitFrom) || (to && !explicitTo)) throw new AppError('Invalid report date range', 400, 'INVALID_DATE_RANGE')
  if (explicitFrom && explicitTo) {
    if (explicitFrom >= explicitTo) throw new AppError('Report end date must be after the start date', 400, 'INVALID_DATE_RANGE')
    return { period: normalizedPeriod, from: explicitFrom, to: explicitTo }
  }

  const anchor = validDate(reference) || new Date()
  const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()))
  const end = new Date(start)
  if (normalizedPeriod === 'week') {
    const day = start.getUTCDay() || 7
    start.setUTCDate(start.getUTCDate() - day + 1)
    end.setTime(start.getTime())
    end.setUTCDate(end.getUTCDate() + 7)
  } else if (normalizedPeriod === 'month') {
    start.setUTCDate(1)
    end.setTime(start.getTime())
    end.setUTCMonth(end.getUTCMonth() + 1)
  } else if (normalizedPeriod === 'year') {
    start.setUTCMonth(0, 1)
    end.setTime(start.getTime())
    end.setUTCFullYear(end.getUTCFullYear() + 1)
  } else {
    end.setUTCDate(end.getUTCDate() + 1)
  }
  return { period: normalizedPeriod, from: start, to: end }
}

const safeTimezone = (value) => {
  const timezone = String(value || 'UTC')
  return /^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+.-]+)+$/.test(timezone) && timezone.length <= 64 ? timezone : 'UTC'
}

const getOrderReport = async ({ period, from, to, reference, timezone }) => {
  const range = getReportRange({ period, from, to, reference })
  const reportTimezone = safeTimezone(timezone)
  const trendFormat = range.period === 'day' ? '%H:00' : range.period === 'year' ? '%Y-%m' : '%Y-%m-%d'
  const restaurant = process.env.DEFAULT_RESTAURANT_ID || 'default'
  const ineligiblePaymentStatuses = ['FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED']

  const [result] = await orderModel.aggregate([
    { $match: { restaurant: { $in: [restaurant, null] }, createdAt: { $gte: range.from, $lt: range.to } } },
    {
      $addFields: {
        reportStatus: { $toUpper: { $ifNull: ['$status', { $ifNull: ['$order_status', 'UNKNOWN'] }] } },
        reportPaymentStatus: { $toUpper: { $ifNull: ['$payment.status', { $ifNull: ['$payment_status', 'UNKNOWN'] }] } },
        reportPaymentMethod: { $toUpper: { $ifNull: ['$payment.method', 'UNKNOWN'] } },
        reportOrderType: { $toUpper: { $ifNull: ['$orderType', 'LEGACY'] } },
        reportValue: { $ifNull: ['$pricing.grandTotal', { $ifNull: ['$totalAmt', 0] }] },
        reportItems: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ['$items', []] } }, 0] },
            '$items',
            [{ product: '$productId', nameSnapshot: '$product_details.name', quantity: 1, subtotal: { $ifNull: ['$totalAmt', 0] } }],
          ],
        },
      },
    },
    {
      $addFields: {
        revenueEligible: {
          $and: [
            { $ne: ['$reportStatus', 'CANCELLED'] },
            { $eq: [{ $in: ['$reportPaymentStatus', ineligiblePaymentStatuses] }, false] },
          ],
        },
        reportItemQuantity: { $sum: '$reportItems.quantity' },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              revenue: { $sum: { $cond: ['$revenueEligible', '$reportValue', 0] } },
              itemsSold: { $sum: { $cond: ['$revenueEligible', '$reportItemQuantity', 0] } },
              completedOrders: { $sum: { $cond: [{ $eq: ['$reportStatus', 'COMPLETED'] }, 1, 0] } },
              cancelledOrders: { $sum: { $cond: [{ $eq: ['$reportStatus', 'CANCELLED'] }, 1, 0] } },
            },
          },
          { $project: { _id: 0, orderCount: 1, revenue: 1, itemsSold: 1, completedOrders: 1, cancelledOrders: 1, averageOrderValue: { $cond: [{ $gt: ['$orderCount', 0] }, { $divide: ['$revenue', '$orderCount'] }, 0] } } },
        ],
        topProducts: [
          { $match: { revenueEligible: true } },
          { $unwind: '$reportItems' },
          { $group: { _id: { $ifNull: ['$reportItems.product', '$reportItems.nameSnapshot'] }, name: { $first: { $ifNull: ['$reportItems.nameSnapshot', 'Legacy item'] } }, image: { $first: { $arrayElemAt: [{ $ifNull: ['$reportItems.imageSnapshot', []] }, 0] } }, quantity: { $sum: { $ifNull: ['$reportItems.quantity', 1] } }, revenue: { $sum: { $ifNull: ['$reportItems.subtotal', 0] } } } },
          { $sort: { quantity: -1, revenue: -1 } },
          { $limit: 8 },
          { $project: { _id: 0, productId: '$_id', name: 1, image: 1, quantity: 1, revenue: 1 } },
        ],
        orderTypes: [
          { $group: { _id: '$reportOrderType', count: { $sum: 1 }, revenue: { $sum: { $cond: ['$revenueEligible', '$reportValue', 0] } } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, label: '$_id', count: 1, revenue: 1 } },
        ],
        paymentMethods: [
          { $group: { _id: '$reportPaymentMethod', count: { $sum: 1 }, revenue: { $sum: { $cond: ['$revenueEligible', '$reportValue', 0] } } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, label: '$_id', count: 1, revenue: 1 } },
        ],
        trend: [
          { $group: { _id: { $dateToString: { date: '$createdAt', format: trendFormat, timezone: reportTimezone } }, orders: { $sum: 1 }, revenue: { $sum: { $cond: ['$revenueEligible', '$reportValue', 0] } } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, label: '$_id', orders: 1, revenue: 1 } },
        ],
      },
    },
  ])

  return {
    period: range.period,
    range: { from: range.from, to: range.to, timezone: reportTimezone },
    summary: result?.summary?.[0] || { orderCount: 0, revenue: 0, itemsSold: 0, completedOrders: 0, cancelledOrders: 0, averageOrderValue: 0 },
    topProducts: result?.topProducts || [],
    orderTypes: result?.orderTypes || [],
    paymentMethods: result?.paymentMethods || [],
    trend: result?.trend || [],
  }
}

const getTopCustomers = async ({ from, to, limit = 5 }) => {
  const restaurant = process.env.DEFAULT_RESTAURANT_ID || 'default'
  return orderModel.aggregate([
    { $match: { restaurant: { $in: [restaurant, null] }, createdAt: { $gte: from, $lt: to } } },
    {
      $addFields: {
        reportStatus: { $toUpper: { $ifNull: ['$status', { $ifNull: ['$order_status', 'UNKNOWN'] }] } },
        reportPaymentStatus: { $toUpper: { $ifNull: ['$payment.status', { $ifNull: ['$payment_status', 'UNKNOWN'] }] } },
        reportValue: { $ifNull: ['$pricing.grandTotal', { $ifNull: ['$totalAmt', 0] }] },
      },
    },
    { $match: { reportStatus: { $ne: 'CANCELLED' }, reportPaymentStatus: { $nin: ['FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'] } } },
    {
      $lookup: {
        from: userModel.collection.name,
        localField: 'userId',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
    { $match: { 'customer.role': 'USER' } },
    { $group: { _id: '$customer._id', name: { $first: '$customer.name' }, email: { $first: '$customer.email' }, avatar: { $first: '$customer.avatar' }, orderCount: { $sum: 1 }, spend: { $sum: '$reportValue' }, lastOrderAt: { $max: '$createdAt' } } },
    { $sort: { spend: -1, orderCount: -1 } },
    { $limit: Math.min(10, Math.max(1, Number(limit) || 5)) },
    { $project: { _id: 0, userId: '$_id', name: 1, email: 1, avatar: 1, orderCount: 1, spend: 1, lastOrderAt: 1 } },
  ])
}

module.exports = { getReportRange, getOrderReport, getTopCustomers }
