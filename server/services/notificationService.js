const notificationModel = require('../models/notificationModel')
const logger = require('../utils/logger')

const publishNotification = async (data) => {
  try {
    return await notificationModel.create(data)
  } catch (error) {
    logger.warn('notification_publish_failed', { title: data.title, error: error.message })
    return null
  }
}

module.exports = { publishNotification }
