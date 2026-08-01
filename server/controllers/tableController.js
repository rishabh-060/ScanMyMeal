const tableModel = require('../models/tableModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const restaurantId = () => 'default'

const resolveTableController = asyncHandler(async (req, res) => {
  const table = await tableModel.findOne({
    publicId: req.params.publicId,
    restaurant: restaurantId(),
    isActive: true,
  }).select('publicId tableNumber restaurant isActive').lean()
  if (!table) throw new AppError('Table link is invalid or inactive', 404, 'INVALID_TABLE')
  return res.json({ success: true, error: false, data: table })
})

const listTablesController = asyncHandler(async (_req, res) => {
  const tables = await tableModel.find({ restaurant: restaurantId() }).sort({ tableNumber: 1 }).lean()
  return res.json({ success: true, error: false, data: tables })
})

const createTableController = asyncHandler(async (req, res) => {
  const tableNumber = String(req.body.tableNumber || '').trim()
  if (!tableNumber || tableNumber.length > 30) {
    throw new AppError('A valid table number is required', 400, 'INVALID_TABLE_NUMBER')
  }
  const table = await tableModel.create({
    tableNumber,
    table_no: tableNumber,
    restaurant: restaurantId(),
    userId: req.userId,
  })
  return res.status(201).json({ success: true, error: false, message: 'Table created', data: table })
})

const updateTableController = asyncHandler(async (req, res) => {
  const updates = {}
  if (req.body.tableNumber !== undefined) {
    const tableNumber = String(req.body.tableNumber).trim()
    if (!tableNumber || tableNumber.length > 30) throw new AppError('Invalid table number', 400, 'INVALID_TABLE_NUMBER')
    updates.tableNumber = tableNumber
    updates.table_no = tableNumber
  }
  if (req.body.isActive !== undefined) {
    updates.isActive = Boolean(req.body.isActive)
    updates.status = Boolean(req.body.isActive)
  }
  const table = await tableModel.findOneAndUpdate(
    { publicId: req.params.publicId, restaurant: restaurantId() },
    { $set: updates },
    { new: true, runValidators: true },
  )
  if (!table) throw new AppError('Table not found', 404, 'TABLE_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Table updated', data: table })
})

const deleteTableController = asyncHandler(async (req, res) => {
  const table = await tableModel.findOneAndUpdate(
    { publicId: req.params.publicId, restaurant: restaurantId() },
    { $set: { isActive: false, status: false } },
    { new: true },
  )
  if (!table) throw new AppError('Table not found', 404, 'TABLE_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Table deactivated', data: table })
})

module.exports = {
  resolveTableController,
  listTablesController,
  createTableController,
  updateTableController,
  deleteTableController,
}
