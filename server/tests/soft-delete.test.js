const test = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const softDeletePlugin = require('../models/plugins/softDeletePlugin')

const modelName = `SoftDeletePluginTest${Date.now()}`
const schema = new mongoose.Schema({ name: String })
schema.plugin(softDeletePlugin)
const Model = mongoose.model(modelName, schema)

const runPreHook = (name, context, args = []) => new Promise((resolve, reject) => {
  schema.s.hooks.execPre(name, context, args, (error) => (error ? reject(error) : resolve()))
})

test.after(() => mongoose.deleteModel(modelName))

test('soft-delete plugin adds recoverability fields with safe defaults', () => {
  const document = new Model({ name: 'Recoverable record' })
  assert.equal(document.isActive, true)
  assert.equal(document.isDeleted, false)
  assert.equal(document.deletedAt, null)
  assert.equal(document.deletedBy, null)
})

test('ordinary queries automatically exclude soft-deleted records', async () => {
  const query = Model.find({ name: 'Visible' })
  await runPreHook('find', query)
  assert.deepEqual(query.getFilter().isDeleted, { $ne: true })

  const recycleBinQuery = Model.find({}).withDeleted()
  await runPreHook('find', recycleBinQuery)
  assert.equal(recycleBinQuery.getFilter().isDeleted, undefined)

  const unprivilegedDeletedQuery = Model.find({ isDeleted: true })
  await runPreHook('find', unprivilegedDeletedQuery)
  assert.deepEqual(unprivilegedDeletedQuery.getFilter().isDeleted, { $ne: true })
})

test('soft delete and restore helpers update state without removing documents', () => {
  const deletedBy = new mongoose.Types.ObjectId()
  const deleteQuery = Model.softDeleteOne({ name: 'Keep me' }, { deletedBy })
  assert.deepEqual(deleteQuery.getFilter().isDeleted, { $ne: true })
  assert.equal(deleteQuery.getUpdate().$set.isActive, false)
  assert.equal(deleteQuery.getUpdate().$set.isDeleted, true)
  assert.ok(deleteQuery.getUpdate().$set.deletedAt instanceof Date)
  assert.equal(String(deleteQuery.getUpdate().$set.deletedBy), String(deletedBy))

  const restoreQuery = Model.restoreOne({ name: 'Keep me' })
  assert.equal(restoreQuery.getFilter().isDeleted, true)
  assert.equal(restoreQuery.getUpdate().$set.isActive, true)
  assert.equal(restoreQuery.getUpdate().$set.isDeleted, false)
  assert.equal(restoreQuery.getUpdate().$set.deletedAt, null)
})

test('native hard-delete queries are rejected', async () => {
  const query = Model.deleteOne({ name: 'Never erase' })
  await assert.rejects(runPreHook('deleteOne', query), /Permanent deletion is disabled/)
  await assert.rejects(
    runPreHook('bulkWrite', Model, [[{ deleteMany: { filter: {} } }]]),
    /Permanent deletion is disabled/,
  )
})
