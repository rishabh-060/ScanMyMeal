const addressModel = require('../models/addressModel')
const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const addressPayload = (body) => {
  const payload = {
    address_line: String(body.address_line || '').trim(),
    mobile: Number(body.mobile),
    city: String(body.city || '').trim(),
    state: String(body.state || '').trim(),
    pincode: String(body.pincode || '').trim(),
    country: String(body.country || '').trim(),
  }
  if (!payload.address_line || !Number.isFinite(payload.mobile) || !payload.city || !payload.state || !payload.pincode || !payload.country) {
    throw new AppError('All address fields are required', 400, 'INVALID_ADDRESS')
  }
  return payload
}

const addAddressController = asyncHandler(async (req, res) => {
  const address = await addressModel.create({ ...addressPayload(req.body), userId: req.userId })
  await userModel.updateOne({ _id: req.userId }, { $addToSet: { address_details: address._id } })
  return res.status(201).json({ success: true, error: false, message: 'Address added successfully', data: address })
})

const getAddressController = asyncHandler(async (req, res) => {
  const addresses = await addressModel.find({ userId: req.userId }).sort({ createdAt: -1 })
  return res.json({ success: true, error: false, message: 'Addresses fetched successfully', data: addresses })
})

const updateAddressController = asyncHandler(async (req, res) => {
  const address = await addressModel.findOneAndUpdate(
    { _id: req.body._id, userId: req.userId, status: true },
    { $set: addressPayload(req.body) },
    { new: true, runValidators: true },
  )
  if (!address) throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Address updated successfully', data: address })
})

const removeAddressController = asyncHandler(async (req, res) => {
  const address = await addressModel.findOneAndUpdate(
    { _id: req.body._id, userId: req.userId, status: true },
    { $set: { status: false } },
    { new: true },
  )
  if (!address) throw new AppError('Address not found or already removed', 404, 'ADDRESS_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Address removed successfully' })
})

module.exports = { addAddressController, getAddressController, updateAddressController, removeAddressController }
