const inventoryAdjustmentModel = require('../models/inventoryAdjustmentModel')
const productModel = require('../models/productModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const cache = require('../services/cacheService')
const logger = require('../utils/logger')
const { publishNotification } = require('../services/notificationService')

const listInventoryController = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page || '1', 10))
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit || '25', 10)))
  const query = req.query.search ? { name: { $regex: String(req.query.search), $options: 'i' } } : {}
  const [products, total] = await Promise.all([
    productModel.find(query).select('name image stock publish isAvailable updatedAt').sort({ stock: 1, name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    productModel.countDocuments(query),
  ])
  return res.json({ success: true, error: false, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

const adjustInventoryController = asyncHandler(async (req, res) => {
  const delta = Number(req.body.delta)
  const reason = String(req.body.reason || '').trim()
  if (!Number.isInteger(delta) || delta === 0 || !reason) {
    throw new AppError('A non-zero integer delta and reason are required', 400, 'INVALID_INVENTORY_ADJUSTMENT')
  }
  const product = await productModel.findOneAndUpdate(
    { _id: req.params.productId, stock: { $gte: Math.max(0, -delta) } },
    [
      { $set: { stock: { $add: ['$stock', delta] } } },
      { $set: { isAvailable: { $gt: ['$stock', 0] } } },
    ],
    { new: true },
  )
  if (!product) throw new AppError('Product not found or adjustment would make stock negative', 409, 'INVALID_STOCK_LEVEL')
  await inventoryAdjustmentModel.create({ product: product._id, delta, reason, source: 'ADMIN', changedBy: req.userId })
  await cache.removeByPattern('menu:*')
  if (product.stock <= 5) {
    await publishNotification({
      title: product.stock === 0 ? `${product.name} is out of stock` : `${product.name} is running low`,
      message: `${product.stock} units remain after a manual inventory adjustment.`,
      type: product.stock === 0 ? 'URGENT' : 'WARNING',
      audience: 'STAFF',
      actionUrl: '/admin/inventory',
      createdBy: req.userId,
    })
  }
  logger.info('inventory_adjusted', { productId: product._id, delta, reason, adminId: req.userId })
  return res.json({ success: true, error: false, message: 'Inventory adjusted', data: product })
})

module.exports = { listInventoryController, adjustInventoryController }
