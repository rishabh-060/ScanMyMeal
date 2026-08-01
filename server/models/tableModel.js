const { randomUUID } = require('crypto')
const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const tableSchema = new mongoose.Schema({
  publicId: { type: String, default: randomUUID, unique: true, immutable: true, index: true },
  tableNumber: { type: String, required: true, trim: true },
  table_no: { type: String, default: null },
  restaurant: { type: String, required: true, default: 'default', index: true },
  isActive: { type: Boolean, default: true, index: true },
  booked: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
  status: { type: Boolean, default: true },
}, { timestamps: true })

tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true })

tableSchema.pre('validate', function syncLegacyFields(next) {
  if (!this.tableNumber && this.table_no) this.tableNumber = this.table_no
  if (!this.table_no && this.tableNumber) this.table_no = this.tableNumber
  if (this.status === false) this.isActive = false
  next()
})

tableSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('table', tableSchema)
