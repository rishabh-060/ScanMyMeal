const offerModel = require('../models/offerModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const payload = (body) => ({
  name: String(body.name || '').trim(),
  code: String(body.code || '').trim().toUpperCase(),
  description: String(body.description || '').trim(),
  type: String(body.type || '').toUpperCase(),
  value: Number(body.value || 0),
  minOrder: Number(body.minOrder || 0),
  maxDiscount: body.maxDiscount === '' || body.maxDiscount == null ? null : Number(body.maxDiscount),
  usageLimit: body.usageLimit === '' || body.usageLimit == null ? null : Number(body.usageLimit),
  startAt: body.startAt || null,
  endAt: body.endAt || null,
  isActive: body.isActive !== false,
})

const validatePayload = (value) => {
  if (!value.name || !/^[A-Z0-9_-]{3,32}$/.test(value.code)) throw new AppError('A name and valid 3–32 character offer code are required', 400, 'INVALID_OFFER')
  if (!['PERCENTAGE', 'FIXED', 'FREE_DELIVERY'].includes(value.type)) throw new AppError('Invalid offer type', 400, 'INVALID_OFFER_TYPE')
  if (value.type === 'PERCENTAGE' && (value.value <= 0 || value.value > 100)) throw new AppError('Percentage offers must be between 1 and 100', 400, 'INVALID_OFFER_VALUE')
  if (value.type === 'FIXED' && value.value <= 0) throw new AppError('Fixed offers require a positive value', 400, 'INVALID_OFFER_VALUE')
  if (value.startAt && value.endAt && new Date(value.endAt) <= new Date(value.startAt)) throw new AppError('Offer end time must be after its start time', 400, 'INVALID_OFFER_DATES')
}

const listOffersController = asyncHandler(async (_req, res) => {
  const offers = await offerModel.find().populate('createdBy', 'name email').sort({ createdAt: -1 }).lean()
  return res.json({ success: true, error: false, data: offers })
})

const createOfferController = asyncHandler(async (req, res) => {
  const data = payload(req.body)
  validatePayload(data)
  const offer = await offerModel.create({ ...data, createdBy: req.userId })
  return res.status(201).json({ success: true, error: false, message: 'Offer created', data: offer })
})

const updateOfferController = asyncHandler(async (req, res) => {
  const data = payload(req.body)
  validatePayload(data)
  const offer = await offerModel.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true })
  if (!offer) throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Offer updated', data: offer })
})

const setOfferStatusController = asyncHandler(async (req, res) => {
  const offer = await offerModel.findByIdAndUpdate(req.params.id, { $set: { isActive: Boolean(req.body.isActive) } }, { new: true })
  if (!offer) throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND')
  return res.json({ success: true, error: false, message: offer.isActive ? 'Offer activated' : 'Offer paused', data: offer })
})

const deleteOfferController = asyncHandler(async (req, res) => {
  const offer = await offerModel.findByIdAndDelete(req.params.id)
  if (!offer) throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Offer deleted' })
})

module.exports = { listOffersController, createOfferController, updateOfferController, setOfferStatusController, deleteOfferController }
