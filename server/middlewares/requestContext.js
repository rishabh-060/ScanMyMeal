const { randomUUID } = require('crypto')
const logger = require('../utils/logger')

const requestContext = (req, res, next) => {
  req.requestId = req.get('x-request-id') || randomUUID()
  res.setHeader('x-request-id', req.requestId)
  const startedAt = Date.now()

  res.on('finish', () => {
    logger.info('http_request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.userId,
    })
  })

  next()
}

module.exports = requestContext
