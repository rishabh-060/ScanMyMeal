const { Router } = require('express')
const auth = require('../middlewares/auth')
const { CashOnDeliveryController, CardPaymentController, validateOfferController, getOrderProductsController, getOrderDetailsController } = require('../controllers/orderController')
const { createRateLimiter } = require('../middlewares/rateLimit')

const orderRouter = Router()

const orderLimiter = createRateLimiter({ scope: 'order-create', limit: 12, windowMs: 60_000 })
const offerLimiter = createRateLimiter({ scope: 'offer-preview', limit: 30, windowMs: 60_000 })

orderRouter.post('/COD-order', auth, orderLimiter, CashOnDeliveryController)
orderRouter.post('/PAID-order', auth, orderLimiter, CardPaymentController)
orderRouter.post('/validate-offer', auth, offerLimiter, validateOfferController)
orderRouter.get('/get-orders', auth, getOrderProductsController)
orderRouter.get('/:orderId', auth, getOrderDetailsController)

module.exports = { orderRouter }
