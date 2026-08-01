const cache = require('../services/cacheService')

const memoryCounters = new Map()

const consumeMemory = (key, windowMs) => {
  const now = Date.now()
  if (memoryCounters.size > 10_000) {
    for (const [counterKey, counter] of memoryCounters) {
      if (counter.expiresAt <= now) memoryCounters.delete(counterKey)
    }
  }
  const existing = memoryCounters.get(key)
  if (!existing || existing.expiresAt <= now) {
    memoryCounters.set(key, { count: 1, expiresAt: now + windowMs })
    return 1
  }
  existing.count += 1
  return existing.count
}

const createRateLimiter = ({ scope, limit, windowMs }) => async (req, res, next) => {
  const identity = req.userId || req.ip || 'unknown'
  const key = `rate-limit:${scope}:${identity}`
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000))
  let count = await cache.increment(key, ttlSeconds)
  if (count === null) count = consumeMemory(key, windowMs)

  res.setHeader('RateLimit-Limit', String(limit))
  res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - count)))
  if (count > limit) {
    return res.status(429).json({
      success: false,
      error: true,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
      requestId: req.requestId,
    })
  }
  next()
}

module.exports = { createRateLimiter }
