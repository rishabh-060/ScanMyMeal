const offerModel = require('../models/offerModel')
const AppError = require('../utils/AppError')
const { roundCurrency } = require('./pricingService')

const resolveOffer = async (code, pricing, session) => {
  const normalized = String(code || '').trim().toUpperCase()
  if (!normalized) return null
  let query = offerModel.findOne({ code: normalized, isActive: true })
  if (session) query = query.session(session)
  const offer = await query
  const now = new Date()
  if (!offer || (offer.startAt && offer.startAt > now) || (offer.endAt && offer.endAt <= now)) {
    throw new AppError('Offer code is invalid or inactive', 409, 'OFFER_UNAVAILABLE')
  }
  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) throw new AppError('This offer has reached its usage limit', 409, 'OFFER_LIMIT_REACHED')
  const itemTotal = roundCurrency(pricing.subtotal - pricing.discount)
  if (itemTotal < offer.minOrder) throw new AppError(`This offer requires a minimum order of ₹${offer.minOrder}`, 409, 'OFFER_MINIMUM_NOT_MET')
  let discount = 0
  if (offer.type === 'PERCENTAGE') discount = roundCurrency(itemTotal * (offer.value / 100))
  if (offer.type === 'FIXED') discount = Math.min(itemTotal, roundCurrency(offer.value))
  if (offer.type === 'FREE_DELIVERY') discount = roundCurrency(pricing.deliveryCharge)
  if (offer.maxDiscount != null) discount = Math.min(discount, roundCurrency(offer.maxDiscount))
  if (discount <= 0) throw new AppError('This offer does not apply to the current order', 409, 'OFFER_NOT_APPLICABLE')
  return { offer, discount: roundCurrency(discount) }
}

const applyOffer = (pricing, resolved) => {
  if (!resolved) return pricing
  return {
    ...pricing,
    offerDiscount: resolved.discount,
    offerCode: resolved.offer.code,
    grandTotal: roundCurrency(Math.max(0, pricing.grandTotal - resolved.discount)),
  }
}

const redeemOffer = async (offer, session) => {
  const result = await offerModel.updateOne(
    {
      _id: offer._id,
      isActive: true,
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    },
    { $inc: { usedCount: 1 } },
    session ? { session } : {},
  )
  if (result.modifiedCount !== 1) throw new AppError('This offer is no longer available', 409, 'OFFER_LIMIT_REACHED')
}

const releaseOfferRedemption = (offerId) => offerModel.updateOne(
  { _id: offerId, usedCount: { $gt: 0 } },
  { $inc: { usedCount: -1 } },
)

module.exports = { resolveOffer, applyOffer, redeemOffer, releaseOfferRedemption }
