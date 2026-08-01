const mongoose = require('mongoose')
const logger = require('../utils/logger')
const productModel = require('../models/productModel')
const notificationModel = require('../models/notificationModel')

const ensureNotificationsAreRecoverable = async (connection) => {
  const database = connection.connection.db
  const collectionName = notificationModel.collection.collectionName
  const collectionExists = await database.listCollections({ name: collectionName }, { nameOnly: true }).hasNext()
  if (!collectionExists) return

  const collection = database.collection(collectionName)
  const indexes = await collection.indexes()
  const ttlIndexes = indexes.filter((index) => index.key?.expiresAt === 1 && index.expireAfterSeconds !== undefined)
  for (const index of ttlIndexes) await collection.dropIndex(index.name)
  if (ttlIndexes.length > 0) {
    await collection.createIndex({ expiresAt: 1 }, { sparse: true, name: 'expiresAt_1' })
    logger.info('notification_ttl_index_replaced', { count: ttlIndexes.length })
  }
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000,
  })
  logger.info('mongodb_connected', { host: connection.connection.host })

  // A MongoDB TTL index permanently erases expired notifications. Replace any
  // legacy TTL index before accepting traffic so expiration remains a UI filter.
  await ensureNotificationsAreRecoverable(connection)

  try {
    await productModel.createIndexes()
    logger.info('product_indexes_ready')
  } catch (error) {
    // Search has a regex fallback, so an index permission or timing issue must not
    // prevent the rest of the API from starting.
    logger.warn('product_index_creation_failed', { error: error.message })
  }

  return connection
}

module.exports = connectDB
