const isBannerActive = (banner, now = new Date()) => {
  if (!banner.isActive) return false
  if (banner.startAt && new Date(banner.startAt) > now) return false
  if (banner.endAt && new Date(banner.endAt) <= now) return false
  return true
}

module.exports = { isBannerActive }
