const test = require('node:test')
const assert = require('node:assert/strict')
const { getReportRange } = require('../services/reportService')

test('daily reports default to one calendar day', () => {
  const range = getReportRange({ period: 'day', reference: '2026-08-02T10:30:00.000Z' })
  assert.equal(range.from.toISOString(), '2026-08-02T00:00:00.000Z')
  assert.equal(range.to.toISOString(), '2026-08-03T00:00:00.000Z')
})

test('weekly reports start on Monday and end after seven days', () => {
  const range = getReportRange({ period: 'week', reference: '2026-08-02T10:30:00.000Z' })
  assert.equal(range.from.toISOString(), '2026-07-27T00:00:00.000Z')
  assert.equal(range.to.toISOString(), '2026-08-03T00:00:00.000Z')
})

test('explicit report ranges reject an end before the start', () => {
  assert.throws(() => getReportRange({ from: '2026-08-03', to: '2026-08-02' }), /after the start date/)
})
