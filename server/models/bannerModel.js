const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  subtitle: { type: String, default: '', trim: true, maxlength: 240 },
  mediaType: { type: String, enum: ['IMAGE', 'GIF', 'VIDEO'], default: 'IMAGE' },
  desktopMediaUrl: { type: String, required: true, trim: true },
  desktopMediaPublicId: { type: String, default: '' },
  mobileMediaUrl: { type: String, default: '', trim: true },
  mobileMediaPublicId: { type: String, default: '' },
  altText: { type: String, required: true, trim: true, maxlength: 180 },
  ctaText: { type: String, default: '', trim: true, maxlength: 60 },
  ctaUrl: { type: String, default: '', trim: true, maxlength: 500 },
  displayOrder: { type: Number, default: 0, min: 0 },
  autoSlideMs: { type: Number, default: 5000, min: 2000, max: 30000 },
  isActive: { type: Boolean, default: true },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

bannerSchema.index({ isActive: 1, displayOrder: 1, startAt: 1, endAt: 1 })
bannerSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('banner', bannerSchema)
