const { Router } = require('express')
const auth = require('../middlewares/auth')
const { CashOnDeliveryController, CardPaymentController, getOrderProductsController, getOrderDetailsController } = require('../controllers/orderController')
const { createRateLimiter } = require('../middlewares/rateLimit')

const orderRouter = Router()

const orderLimiter = createRateLimiter({ scope: 'order-create', limit: 12, windowMs: 60_000 })

orderRouter.post('/COD-order', auth, orderLimiter, CashOnDeliveryController)
orderRouter.post('/PAID-order', auth, orderLimiter, CardPaymentController)
orderRouter.get('/get-orders', auth, getOrderProductsController)
orderRouter.get('/:orderId', auth, getOrderDetailsController)

module.exports = { orderRouter }
