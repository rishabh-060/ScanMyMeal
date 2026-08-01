require('dotenv').config()
const mongoose = require('mongoose')
const orderModel = require('../models/orderModel')

const apply = process.argv.includes('--apply')

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
  await mongoose.connect(process.env.MONGODB_URI)
  const legacyQuery = { $or: [{ schemaVersion: { $exists: false } }, { schemaVersion: { $lt: 2 } }] }
  const count = await orderModel.countDocuments(legacyQuery)
  process.stdout.write(`Legacy order documents found: ${count}\n`)
  if (!apply) {
    process.stdout.write('Dry run only. Re-run with --apply after taking a database backup.\n')
    return
  }
  const result = await orderModel.updateMany(legacyQuery, [{
    $set: {
      schemaVersion: 1,
      publicOrderId: { $ifNull: ['$publicOrderId', '$orderId'] },
      status: {
        $switch: {
          branches: [
            { case: { $eq: ['$order_status', 'confirmed'] }, then: 'CONFIRMED' },
            { case: { $eq: ['$order_status', 'preparing'] }, then: 'PREPARING' },
            { case: { $eq: ['$order_status', 'ready'] }, then: 'READY' },
            { case: { $eq: ['$order_status', 'delivered'] }, then: 'COMPLETED' },
            { case: { $eq: ['$order_status', 'cancelled'] }, then: 'CANCELLED' },
          ],
          default: 'PLACED',
        },
      },
    },
  }])
  process.stdout.write(`Marked ${result.modifiedCount} legacy documents without merging them.\n`)
}

run()
  .catch((error) => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1 })
  .finally(() => mongoose.disconnect())
