const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')
const {
  ORDER_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} = require('../constants/order')

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.ObjectId, ref: 'product', required: true },
  nameSnapshot: { type: String, required: true, trim: true },
  imageSnapshot: { type: [String], default: [] },
  priceSnapshot: { type: Number, required: true, min: 0 },
  discountSnapshot: { type: Number, default: 0, min: 0, max: 100 },
  quantity: { type: Number, required: true, min: 1 },
  selectedVariant: { type: mongoose.Schema.Types.Mixed, default: null },
  addOns: { type: [mongoose.Schema.Types.Mixed], default: [] },
  itemInstructions: { type: String, default: '', maxlength: 500 },
  subtotal: { type: Number, required: true, min: 0 },
}, { _id: false })

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
  source: { type: String, required: true, default: 'CUSTOMER_APP' },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: '', maxlength: 500 },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  schemaVersion: { type: Number, default: 2 },
  publicOrderId: { type: String, unique: true, sparse: true, index: true },
  orderId: { type: String, unique: true, sparse: true },
  idempotencyKey: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
  guestSessionId: { type: String, default: null, select: false },
  restaurant: { type: String, required: true, default: 'default', index: true },
  table: { type: mongoose.Schema.ObjectId, ref: 'table', default: null },
  table_num: { type: mongoose.Schema.ObjectId, ref: 'table', default: null },
  orderType: { type: String, enum: Object.values(ORDER_TYPES), default: ORDER_TYPES.DELIVERY },
  items: { type: [orderItemSchema], default: [] },
  pricing: {
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    offerDiscount: { type: Number, default: 0, min: 0 },
    offerCode: { type: String, default: '' },
    grandTotal: { type: Number, default: 0, min: 0 },
  },
  offer: {
    offerId: { type: mongoose.Schema.ObjectId, ref: 'offer', default: null },
    code: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: '' },
    value: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
  },
  payment: {
    method: { type: String, enum: Object.values(PAYMENT_METHODS), default: PAYMENT_METHODS.CASH },
    status: { type: String, enum: Object.values(PAYMENT_STATUSES), default: PAYMENT_STATUSES.PENDING },
    provider: { type: String, default: '' },
    providerPaymentId: { type: String, default: '', index: true },
    providerOrderId: { type: String, default: '' },
    transactionReference: { type: String, default: '' },
    processedEventIds: { type: [String], default: [], select: false },
  },
  inventory: {
    state: { type: String, enum: ['NONE', 'RESERVED', 'COMMITTED', 'RELEASED'], default: 'NONE' },
    updatedAt: { type: Date, default: null },
  },
  status: { type: String, enum: Object.values(ORDER_STATUSES), default: ORDER_STATUSES.PLACED, index: true },
  statusHistory: { type: [statusHistorySchema], default: [] },
  delivery_address: { type: mongoose.Schema.ObjectId, ref: 'address', default: null },
  deliveryAddress: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    addressLine: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  pickupTime: { type: Date, default: null },
  pickupInstructions: { type: String, default: '', maxlength: 500 },
  customerInstructions: { type: String, default: '', maxlength: 500 },
  expiresAt: { type: Date, default: null },

  // Legacy fields remain readable until the documented migration is complete.
  productId: { type: mongoose.Schema.ObjectId, ref: 'product' },
  order_status: { type: String },
  product_details: { name: String, image: Array },
  paymentId: { type: String, default: '' },
  payment_status: { type: String, default: '' },
  subTotalAmt: { type: Number, default: 0 },
  totalAmt: { type: Number, default: 0 },
  invoice_receipt: { type: String, default: '' },
}, { timestamps: true })

orderSchema.index({ userId: 1, createdAt: -1 })
orderSchema.index({ restaurant: 1, createdAt: -1 })
orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 })
orderSchema.index({ table: 1, createdAt: -1 })
orderSchema.index({ 'payment.providerOrderId': 1 }, { sparse: true })
orderSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('order', orderSchema)
