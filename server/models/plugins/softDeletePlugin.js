const mongoose = require('mongoose')

const ACTIVE_FILTER = { isDeleted: { $ne: true } }
const HARD_DELETE_ERROR = 'Permanent deletion is disabled for this model. Use softDeleteOne or softDeleteMany instead.'

const softDeletePlugin = (schema) => {
  if (!schema.path('isActive')) {
    schema.add({ isActive: { type: Boolean, default: true, index: true } })
  }

  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.ObjectId, ref: 'User', default: null },
  })

  const excludeDeleted = function excludeDeleted(next) {
    if (!this.getOptions().withDeleted) {
      this.where(ACTIVE_FILTER)
    }
    next()
  }

  schema.pre(
    ['find', 'findOne', 'countDocuments', 'distinct', 'updateOne', 'updateMany', 'replaceOne', 'findOneAndUpdate', 'findOneAndReplace'],
    excludeDeleted,
  )

  schema.pre('aggregate', function excludeDeletedAggregates(next) {
    if (this.options?.withDeleted) return next()
    const pipeline = this.pipeline()
    const insertionIndex = pipeline[0]?.$geoNear || pipeline[0]?.$search ? 1 : 0
    pipeline.splice(insertionIndex, 0, { $match: ACTIVE_FILTER })
    return next()
  })

  const blockHardDelete = function blockHardDelete(next) {
    return next(new Error(HARD_DELETE_ERROR))
  }

  schema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete', 'findOneAndRemove'], { query: true, document: false }, blockHardDelete)
  schema.pre('deleteOne', { query: false, document: true }, function blockDocumentDelete(next) {
    return next(new Error(HARD_DELETE_ERROR))
  })
  schema.pre('bulkWrite', function blockBulkHardDeletes(next, operations) {
    const containsDelete = operations.some((operation) => operation.deleteOne || operation.deleteMany)
    return containsDelete ? next(new Error(HARD_DELETE_ERROR)) : next()
  })

  schema.query.withDeleted = function withDeleted() {
    return this.setOptions({ withDeleted: true })
  }

  schema.statics.softDeleteOne = function softDeleteOne(filter, { deletedBy = null, session = null, set = {} } = {}) {
    return this.findOneAndUpdate(
      { ...filter, isDeleted: { $ne: true } },
      {
        $set: {
          ...set,
          isActive: false,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
        },
      },
      { new: true, session, withDeleted: true },
    )
  }

  schema.statics.softDeleteMany = function softDeleteMany(filter, { deletedBy = null, session = null, set = {} } = {}) {
    return this.updateMany(
      { ...filter, isDeleted: { $ne: true } },
      {
        $set: {
          ...set,
          isActive: false,
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
        },
      },
      { session, withDeleted: true },
    )
  }

  schema.statics.restoreOne = function restoreOne(filter, { session = null, set = {} } = {}) {
    return this.findOneAndUpdate(
      { ...filter, isDeleted: true },
      {
        $set: {
          ...set,
          isActive: true,
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      },
      { new: true, session, withDeleted: true },
    )
  }
}

module.exports = softDeletePlugin
