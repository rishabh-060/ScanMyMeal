const { Router } = require('express')
const { resolveTableController } = require('../controllers/tableController')
const { createRateLimiter } = require('../middlewares/rateLimit')

const tableRouter = Router()
tableRouter.get('/resolve/:publicId', createRateLimiter({ scope: 'qr-resolution', limit: 30, windowMs: 60_000 }), resolveTableController)

module.exports = tableRouter
