const AppError = require('../utils/AppError')
const logger = require('../utils/logger')

const notFoundHandler = (req, res, next) => {
  next(new AppError('Route not found', 404, 'ROUTE_NOT_FOUND'))
}

const errorHandler = (error, req, res, _next) => {
  const duplicate = error.code === 11000
  const statusCode = error.statusCode || (duplicate ? 409 : error.name === 'ValidationError' || error.code === 'LIMIT_FILE_SIZE' ? 400 : 500)
  const isProduction = process.env.NODE_ENV === 'production'
  const message = duplicate ? 'A record with this unique value already exists' : statusCode >= 500 && isProduction ? 'Internal server error' : error.message

  logger.error('request_failed', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code: error.code,
    error: error.message,
    ...(isProduction ? {} : { stack: error.stack }),
  })

  return res.status(statusCode).json({
    success: false,
    error: true,
    message,
    code: duplicate ? 'DUPLICATE_RESOURCE' : error.code || 'INTERNAL_ERROR',
    details: error.details || [],
    requestId: req.requestId,
  })
}

module.exports = { notFoundHandler, errorHandler }
