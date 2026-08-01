const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const cache = require('../services/cacheService')

const addToCartController = asyncHandler(async (req, res) => {
  const product = await productModel.findOne({
    _id: req.body.productId,
    publish: true,
    isAvailable: { $ne: false },
    stock: { $gte: 1 },
  })
  if (!product) {
    await cache.removeByPattern('menu:*')
    throw new AppError('Product is unavailable', 409, 'PRODUCT_UNAVAILABLE')
  }
  if (await cartModel.exists({ userId: req.userId, product: product._id })) {
    throw new AppError('Product is already in the cart', 409, 'CART_ITEM_EXISTS')
  }
  const cartItem = await cartModel.create({ quantity: 1, userId: req.userId, product: product._id })
  await userModel.updateOne({ _id: req.userId }, { $addToSet: { shopping_cart: cartItem._id } })
  return res.status(201).json({ success: true, error: false, message: 'Item added successfully', data: cartItem })
})

const getCartController = asyncHandler(async (req, res) => {
  const cartItems = await cartModel.find({ userId: req.userId }).populate('product').sort({ createdAt: 1 })
  return res.json({ success: true, error: false, message: 'Cart fetched successfully', data: cartItems })
})

const updateCartItemQtyController = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.qty)
  if (!Number.isInteger(quantity) || quantity < 1) throw new AppError('Quantity must be a positive integer', 400, 'INVALID_QUANTITY')
  const cartItem = await cartModel.findOne({ _id: req.body._id, userId: req.userId }).populate('product')
  if (!cartItem) throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND')
  if (!cartItem.product?.publish || cartItem.product?.isAvailable === false || cartItem.product.stock < quantity) {
    throw new AppError(`Only ${cartItem.product?.stock || 0} units are available`, 409, 'INSUFFICIENT_STOCK')
  }
  cartItem.quantity = quantity
  await cartItem.save()
  return res.json({ success: true, error: false, message: 'Cart quantity updated', data: cartItem })
})

const removeFromCartController = asyncHandler(async (req, res) => {
  const cartItem = await cartModel.findOneAndDelete({ _id: req.body._id, userId: req.userId })
  if (!cartItem) throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND')
  await userModel.updateOne({ _id: req.userId }, { $pull: { shopping_cart: cartItem._id } })
  return res.json({ success: true, error: false, message: 'Item removed successfully' })
})

module.exports = { addToCartController, getCartController, removeFromCartController, updateCartItemQtyController }
