const { v2: cloudinary } = require('cloudinary')
const bannerModel = require('../models/bannerModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const cache = require('../services/cacheService')
const logger = require('../utils/logger')
const { isBannerActive } = require('../services/bannerService')

const CACHE_KEY = 'homepage:banners:active'
const CACHE_TTL_SECONDS = 300
const destroyBannerMedia = (publicId, mediaType) => cloudinary.uploader.destroy(publicId, { resource_type: mediaType === 'VIDEO' ? 'video' : 'image' })

const validateUrl = (value, field, { allowRelative = false } = {}) => {
  if (!value && allowRelative) return ''
  if (allowRelative && value.startsWith('/')) return value
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported protocol')
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('HTTPS required')
    return url.toString()
  } catch (_error) {
    throw new AppError(`${field} must be a valid URL`, 400, 'INVALID_URL')
  }
}

const bannerPayload = (body) => {
  const payload = {}
  const stringFields = ['title', 'subtitle', 'altText', 'ctaText', 'desktopMediaPublicId', 'mobileMediaPublicId']
  for (const field of stringFields) {
    if (body[field] !== undefined) payload[field] = String(body[field]).trim()
  }
  if (body.desktopMediaUrl !== undefined) payload.desktopMediaUrl = validateUrl(body.desktopMediaUrl, 'desktopMediaUrl')
  if (body.mobileMediaUrl !== undefined) payload.mobileMediaUrl = body.mobileMediaUrl ? validateUrl(body.mobileMediaUrl, 'mobileMediaUrl') : ''
  if (body.ctaUrl !== undefined) payload.ctaUrl = body.ctaUrl ? validateUrl(body.ctaUrl, 'ctaUrl', { allowRelative: true }) : ''
  if (body.mediaType !== undefined) payload.mediaType = String(body.mediaType).toUpperCase()
  if (body.displayOrder !== undefined) payload.displayOrder = Number(body.displayOrder)
  if (body.autoSlideMs !== undefined) payload.autoSlideMs = Number(body.autoSlideMs)
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive)
  if (body.startAt !== undefined) payload.startAt = body.startAt ? new Date(body.startAt) : null
  if (body.endAt !== undefined) payload.endAt = body.endAt ? new Date(body.endAt) : null
  if (payload.startAt && payload.endAt && payload.endAt <= payload.startAt) {
    throw new AppError('Banner end date must be after its start date', 400, 'INVALID_DATE_RANGE')
  }
  return payload
}

const getActiveBannersController = asyncHandler(async (_req, res) => {
  const cached = await cache.getJson(CACHE_KEY)
  if (cached) return res.json({ success: true, error: false, data: cached.filter((banner) => isBannerActive(banner)), cached: true })
  const now = new Date()
  const banners = await bannerModel.find({
    isActive: true,
    $and: [
      { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
      { $or: [{ endAt: null }, { endAt: { $gt: now } }] },
    ],
  }).sort({ displayOrder: 1, createdAt: -1 }).lean()
  await cache.setJson(CACHE_KEY, banners, CACHE_TTL_SECONDS)
  return res.json({ success: true, error: false, data: banners, cached: false })
})

const listBannersController = asyncHandler(async (_req, res) => {
  const banners = await bannerModel.find().sort({ displayOrder: 1, createdAt: -1 }).lean()
  return res.json({ success: true, error: false, data: banners })
})

const createBannerController = asyncHandler(async (req, res) => {
  const banner = await bannerModel.create({ ...bannerPayload(req.body), createdBy: req.userId })
  await cache.remove(CACHE_KEY)
  logger.info('banner_created', { bannerId: banner._id, adminId: req.userId })
  return res.status(201).json({ success: true, error: false, message: 'Banner created', data: banner })
})

const updateBannerController = asyncHandler(async (req, res) => {
  const oldBanner = await bannerModel.findById(req.params.id)
  if (!oldBanner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND')
  const updates = bannerPayload(req.body)
  const banner = await bannerModel.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
  await cache.remove(CACHE_KEY)
  const replacedIds = []
  if (updates.desktopMediaPublicId && oldBanner.desktopMediaPublicId && updates.desktopMediaPublicId !== oldBanner.desktopMediaPublicId) replacedIds.push(oldBanner.desktopMediaPublicId)
  if (updates.mobileMediaPublicId && oldBanner.mobileMediaPublicId && updates.mobileMediaPublicId !== oldBanner.mobileMediaPublicId) replacedIds.push(oldBanner.mobileMediaPublicId)
  await Promise.allSettled(replacedIds.map((publicId) => destroyBannerMedia(publicId, oldBanner.mediaType)))
  logger.info('banner_updated', { bannerId: banner._id, adminId: req.userId })
  return res.json({ success: true, error: false, message: 'Banner updated', data: banner })
})

const deleteBannerController = asyncHandler(async (req, res) => {
  const banner = await bannerModel.softDeleteOne(
    { _id: req.params.id },
    { deletedBy: req.userId },
  )
  if (!banner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND')
  await cache.remove(CACHE_KEY)
  logger.info('banner_soft_deleted', { bannerId: banner._id, adminId: req.userId })
  return res.json({ success: true, error: false, message: 'Banner deleted' })
})

const reorderBannersController = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.order) || req.body.order.length === 0) {
    throw new AppError('order must be a non-empty array', 400, 'INVALID_BANNER_ORDER')
  }
  await bannerModel.bulkWrite(req.body.order.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { displayOrder: index } } },
  })))
  await cache.remove(CACHE_KEY)
  return res.json({ success: true, error: false, message: 'Banners reordered' })
})

const setBannerStatusController = asyncHandler(async (req, res) => {
  if (typeof req.body.isActive !== 'boolean') throw new AppError('isActive must be boolean', 400, 'INVALID_STATUS')
  const banner = await bannerModel.findByIdAndUpdate(req.params.id, { $set: { isActive: req.body.isActive } }, { new: true })
  if (!banner) throw new AppError('Banner not found', 404, 'BANNER_NOT_FOUND')
  await cache.remove(CACHE_KEY)
  return res.json({ success: true, error: false, message: 'Banner status updated', data: banner })
})

module.exports = {
  getActiveBannersController,
  listBannersController,
  createBannerController,
  updateBannerController,
  deleteBannerController,
  reorderBannersController,
  setBannerStatusController,
}
