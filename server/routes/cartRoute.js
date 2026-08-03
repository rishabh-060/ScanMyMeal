const { Router } = require('express')
const auth = require('../middlewares/auth')
const customerOnly = require('../middlewares/customerOnly')
const { addToCartController, getCartController, updateCartItemQtyController, removeFromCartController } = require('../controllers/cartController')

const cartRouter = Router()

cartRouter.use(auth, customerOnly)
cartRouter.post('/add-cart', addToCartController)
cartRouter.get('/get-cart', getCartController)
cartRouter.put('/update-cart', updateCartItemQtyController)
cartRouter.delete('/delete-cart', removeFromCartController)

module.exports = { cartRouter }
