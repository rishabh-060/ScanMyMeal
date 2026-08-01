const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 32, index: true },
  description: { type: String, default: '', trim: true, maxlength: 300 },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED', 'FREE_DELIVERY'], required: true },
  value: { type: Number, default: 0, min: 0 },
  minOrder: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, default: null, min: 0 },
  usageLimit: { type: Number, default: null, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

offerSchema.index({ isActive: 1, startAt: 1, endAt: 1 })
offerSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('offer', offerSchema)
