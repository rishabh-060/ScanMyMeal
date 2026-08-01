require('dotenv').config()
const mongoose = require('mongoose')
const addressModel = require('../models/addressModel')
const bannerModel = require('../models/bannerModel')
const cartModel = require('../models/cartModel')
const categoryModel = require('../models/categoryModel')
const inventoryAdjustmentModel = require('../models/inventoryAdjustmentModel')
const notificationModel = require('../models/notificationModel')
const offerModel = require('../models/offerModel')
const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel')
const subCategoryModel = require('../models/subCategoryModel')
const tableModel = require('../models/tableModel')
const userModel = require('../models/userModel')

const apply = process.argv.includes('--apply')
const models = [
  addressModel,
  bannerModel,
  cartModel,
  categoryModel,
  inventoryAdjustmentModel,
  notificationModel,
  offerModel,
  orderModel,
  productModel,
  subCategoryModel,
  tableModel,
  userModel,
]

const initializeField = async (collection, field, value) => {
  const filter = { [field]: { $exists: false } }
  const count = await collection.countDocuments(filter)
  if (apply && count > 0) await collection.updateMany(filter, { $set: { [field]: value } })
  return count
}

const replaceNotificationTtlIndex = async () => {
  const collection = notificationModel.collection
  const exists = await mongoose.connection.db
    .listCollections({ name: collection.collectionName }, { nameOnly: true })
    .hasNext()
  if (!exists) return 0
  const indexes = await collection.indexes()
  const ttlIndexes = indexes.filter((index) => index.key?.expiresAt === 1 && index.expireAfterSeconds !== undefined)
  if (!ttlIndexes.length) return 0
  if (apply) {
    for (const index of ttlIndexes) await collection.dropIndex(index.name)
    await collection.createIndex({ expiresAt: 1 }, { sparse: true, name: 'expiresAt_1' })
  }
  return ttlIndexes.length
}

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
  mongoose.set('autoIndex', false)
  await mongoose.connect(process.env.MONGODB_URI)

  let documentsToInitialize = 0
  for (const model of models) {
    const collection = model.collection
    const counts = {
      isActive: await initializeField(collection, 'isActive', true),
      isDeleted: await initializeField(collection, 'isDeleted', false),
      deletedAt: await initializeField(collection, 'deletedAt', null),
      deletedBy: await initializeField(collection, 'deletedBy', null),
    }
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    documentsToInitialize += total
    process.stdout.write(`${collection.collectionName}: ${JSON.stringify(counts)} missing fields\n`)
  }

  const ttlIndexCount = await replaceNotificationTtlIndex()
  process.stdout.write(`Notification TTL indexes to replace: ${ttlIndexCount}\n`)
  process.stdout.write(`Missing field values found: ${documentsToInitialize}\n`)
  if (!apply) {
    process.stdout.write('Dry run only. Back up the database, then re-run with --apply.\n')
  } else {
    process.stdout.write('Soft-delete migration applied successfully.\n')
  }
}

run()
  .catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1 })
  .finally(() => mongoose.disconnect())
