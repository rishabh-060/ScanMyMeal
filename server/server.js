const express = require('express')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const dbConn = require('./config/conn')
const userRouter = require('./routes/userRoute')
const categoryRouter = require('./routes/categoryRoute')
const uploadRouter = require('./routes/uploadRouter')
const { subCategoryRouter } = require('./routes/subCategoryRoute')
const productRouter = require('./routes/productRouter')
const { cartRouter } = require('./routes/cartRoute')
const { addressRouter } = require('./routes/addressRoute')
const { orderRouter } = require('./routes/orderRouter')
const adminRouter = require('./routes/adminRouter')
const tableRouter = require('./routes/tableRoute')
const bannerRouter = require('./routes/bannerRoute')
const { webHookStripe } = require('./controllers/orderController')
const requestContext = require('./middlewares/requestContext')
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler')
const { connectCache, closeCache } = require('./services/cacheService')
const { releaseExpiredReservations } = require('./services/orderService')
const logger = require('./utils/logger')

const app = express()
app.set('trust proxy', 1)

const allowedOrigins = [
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS'))
  },
}))
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(requestContext)

// Stripe requires the untouched request bytes for signature verification.
app.post('/api/order/web-hook', express.raw({ type: 'application/json', limit: '1mb' }), webHookStripe)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }))
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use('/api/sub-category', subCategoryRouter)
app.use('/api/file', uploadRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)
app.use('/api/tables', tableRouter)
app.use('/api/banners', bannerRouter)
app.use('/api/admin', adminRouter)
app.use(notFoundHandler)
app.use(errorHandler)

let server
let reservationTimer

const startServer = async () => {
  await dbConn()
  // await connectCache()
  const port = Number(process.env.PORT || 8080)
  server = app.listen(port, () => logger.info('server_started', { port }))
  reservationTimer = setInterval(() => {
    releaseExpiredReservations().catch((error) => logger.error('reservation_cleanup_failed', { error: error.message }))
  }, 60_000)
  reservationTimer.unref()
  return server
}

const stopServer = async () => {
  if (reservationTimer) clearInterval(reservationTimer)
  // await closeCache()
  if (server) await new Promise((resolve) => server.close(resolve))
}

if (require.main === module) {
  startServer().catch((error) => {
    logger.error('server_start_failed', { error: error.message, stack: error.stack })
    process.exitCode = 1
  })
}

module.exports = { app, startServer, stopServer }
