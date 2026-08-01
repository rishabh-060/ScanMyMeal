const mongoose = require('mongoose')
const logger = require('../utils/logger')
const productModel = require('../models/productModel')

const connectDB = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000,
  })
  logger.info('mongodb_connected', { host: connection.connection.host })

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
