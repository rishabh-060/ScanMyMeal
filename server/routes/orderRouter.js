const { Router } = require('express')
const auth = require('../middlewares/auth')
const express = require('express');
const { CashOnDeliveryController, CardPaymentController, webHookStripe, getOrderProductsController } = require('../controllers/orderController')

const orderRouter = Router()

orderRouter.post('/COD-order', auth, CashOnDeliveryController)
orderRouter.post('/PAID-order', auth, CardPaymentController)
orderRouter.post('/web-hook', express.raw({ type: 'application/json' }), webHookStripe)
orderRouter.get('/get-orders', auth, getOrderProductsController)

module.exports = { orderRouter }