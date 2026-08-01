const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const inventoryAdjustmentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.ObjectId, ref: 'product', required: true, index: true },
  order: { type: mongoose.Schema.ObjectId, ref: 'order', default: null, index: true },
  delta: { type: Number, required: true },
  reason: { type: String, required: true, maxlength: 240 },
  source: { type: String, enum: ['ORDER', 'CANCELLATION', 'PAYMENT_EXPIRY', 'ADMIN'], required: true },
  changedBy: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

inventoryAdjustmentSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('inventoryAdjustment', inventoryAdjustmentSchema)
