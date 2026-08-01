const test = require('node:test')
const assert = require('node:assert/strict')
const { isBannerActive } = require('../services/bannerService')

const now = new Date('2026-07-30T12:00:00Z')
test('banner scheduling filters inactive, future, and expired banners', () => {
  assert.equal(isBannerActive({ isActive: true, startAt: null, endAt: null }, now), true)
  assert.equal(isBannerActive({ isActive: false }, now), false)
  assert.equal(isBannerActive({ isActive: true, startAt: '2026-08-01T00:00:00Z' }, now), false)
  assert.equal(isBannerActive({ isActive: true, endAt: '2026-07-01T00:00:00Z' }, now), false)
})
