const test = require('node:test')
const assert = require('node:assert/strict')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const { addToCartController } = require('../controllers/cartController')

test('add to cart accepts legacy products without an isAvailable field when stock exists', { concurrency: false }, async () => {
  const originalFindOne = productModel.findOne
  const originalCartFindOne = cartModel.findOne
  const originalCreate = cartModel.create
  const originalUpdateOne = userModel.updateOne
  let productQuery

  productModel.findOne = async (query) => {
    productQuery = query
    return { _id: 'product-1', publish: true, stock: 3 }
  }
  cartModel.findOne = () => ({ withDeleted: async () => null })
  cartModel.create = async (data) => ({ _id: 'cart-1', ...data })
  userModel.updateOne = async () => ({ modifiedCount: 1 })

  try {
    const response = await new Promise((resolve, reject) => {
      const res = {
        status(code) { this.statusCode = code; return this },
        json(body) { resolve({ statusCode: this.statusCode, body }) },
      }
      addToCartController(
        { body: { productId: 'product-1' }, userId: 'user-1' },
        res,
        reject,
      )
    })

    assert.equal(response.statusCode, 201)
    assert.equal(response.body.success, true)
    assert.deepEqual(productQuery.isAvailable, { $ne: false })
    assert.deepEqual(productQuery.stock, { $gte: 1 })
  } finally {
    productModel.findOne = originalFindOne
    cartModel.findOne = originalCartFindOne
    cartModel.create = originalCreate
    userModel.updateOne = originalUpdateOne
  }
})
