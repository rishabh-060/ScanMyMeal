const logger = require('../utils/logger')

let redisClient = null
let redisReady = false

const prefix = () => process.env.REDIS_KEY_PREFIX || 'scanmymeal'
const namespaced = (key) => `${prefix()}:${key}`

const connectCache = async () => {
  if (!process.env.REDIS_URL || redisClient) return false
  try {
    const { createClient } = require('redis')
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: { reconnectStrategy: (retries) => Math.min(retries * 250, 5000) },
    })
    redisClient.on('ready', () => {
      redisReady = true
      logger.info('redis_ready')
    })
    redisClient.on('end', () => { redisReady = false })
    redisClient.on('error', (error) => {
      redisReady = false
      logger.warn('redis_unavailable', { error: error.message })
    })
    await redisClient.connect()
    return true
  } catch (error) {
    redisClient = null
    redisReady = false
    logger.warn('redis_connection_failed', { error: error.message })
    return false
  }
}

const getJson = async (key) => {
  if (!redisReady) return null
  try {
    const value = await redisClient.get(namespaced(key))
    return value ? JSON.parse(value) : null
  } catch (error) {
    logger.warn('redis_get_failed', { key, error: error.message })
    return null
  }
}

const setJson = async (key, value, ttlSeconds = 300) => {
  if (!redisReady) return false
  try {
    await redisClient.set(namespaced(key), JSON.stringify(value), { EX: ttlSeconds })
    return true
  } catch (error) {
    logger.warn('redis_set_failed', { key, error: error.message })
    return false
  }
}

const remove = async (...keys) => {
  if (!redisReady || keys.length === 0) return false
  try {
    await redisClient.del(keys.map(namespaced))
    return true
  } catch (error) {
    logger.warn('redis_delete_failed', { keys, error: error.message })
    return false
  }
}

const removeByPattern = async (pattern) => {
  if (!redisReady) return false
  try {
    const keys = []
    for await (const key of redisClient.scanIterator({ MATCH: namespaced(pattern), COUNT: 100 })) {
      keys.push(key)
    }
    if (keys.length) await redisClient.del(keys)
    return true
  } catch (error) {
    logger.warn('redis_pattern_delete_failed', { pattern, error: error.message })
    return false
  }
}

const increment = async (key, ttlSeconds) => {
  if (!redisReady) return null
  try {
    const redisKey = namespaced(key)
    const count = await redisClient.incr(redisKey)
    if (count === 1) await redisClient.expire(redisKey, ttlSeconds)
    return count
  } catch (error) {
    logger.warn('redis_increment_failed', { key, error: error.message })
    return null
  }
}

const closeCache = async () => {
  if (redisClient?.isOpen) await redisClient.quit()
  redisClient = null
  redisReady = false
}

module.exports = {
  connectCache,
  closeCache,
  getJson,
  setJson,
  remove,
  removeByPattern,
  increment,
  isReady: () => redisReady,
}
