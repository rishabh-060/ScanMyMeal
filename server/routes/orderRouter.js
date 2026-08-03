const { Router } = require('express')
const auth = require('../middlewares/auth')
const customerOnly = require('../middlewares/customerOnly')
const { CashOnDeliveryController, CardPaymentController, validateOfferController, getOrderProductsController, getOrderDetailsController } = require('../controllers/orderController')
const { createRateLimiter } = require('../middlewares/rateLimit')

const orderRouter = Router()

const orderLimiter = createRateLimiter({ scope: 'order-create', limit: 12, windowMs: 60_000 })
const offerLimiter = createRateLimiter({ scope: 'offer-preview', limit: 30, windowMs: 60_000 })

orderRouter.use(auth, customerOnly)

orderRouter.post('/COD-order', orderLimiter, CashOnDeliveryController)
orderRouter.post('/PAID-order', orderLimiter, CardPaymentController)
orderRouter.post('/validate-offer', offerLimiter, validateOfferController)
orderRouter.get('/get-orders', getOrderProductsController)
orderRouter.get('/:orderId', getOrderDetailsController)

module.exports = { orderRouter }
