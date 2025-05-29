const { Router } = require('express')
const auth = require('../middlewares/auth')
const { addToCartController, getCartController, updateCartItemQtyController, removeFromCartController } = require('../controllers/cartController')

const cartRouter = Router()

cartRouter.post('/add-cart', auth, addToCartController)
cartRouter.get('/get-cart', auth, getCartController)
cartRouter.put('/update-cart', auth, updateCartItemQtyController)
cartRouter.delete('/delete-cart', auth, removeFromCartController)

module.exports = { cartRouter }