const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 600 },
  type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'URGENT'], default: 'INFO' },
  audience: { type: String, enum: ['STAFF', 'CUSTOMERS', 'ALL'], default: 'STAFF' },
  actionUrl: { type: String, default: '', trim: true, maxlength: 300 },
  expiresAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  readBy: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
}, { timestamps: true })

notificationSchema.index({ audience: 1, createdAt: -1 })
notificationSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('notification', notificationSchema)
