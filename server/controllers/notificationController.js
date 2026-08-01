const notificationModel = require('../models/notificationModel')
const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const listNotificationsController = asyncHandler(async (req, res) => {
  const now = new Date()
  const notifications = await notificationModel.find({
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).populate('createdBy', 'name email').sort({ createdAt: -1 }).limit(100).lean()
  const data = notifications.map((item) => ({ ...item, isRead: item.readBy.some((id) => String(id) === String(req.userId)) }))
  return res.json({ success: true, error: false, data, unread: data.filter((item) => !item.isRead).length })
})

const createNotificationController = asyncHandler(async (req, res) => {
  const title = String(req.body.title || '').trim()
  const message = String(req.body.message || '').trim()
  if (!title || !message) throw new AppError('Title and message are required', 400, 'INVALID_NOTIFICATION')
  const notification = await notificationModel.create({
    title,
    message,
    type: String(req.body.type || 'INFO').toUpperCase(),
    audience: String(req.body.audience || 'STAFF').toUpperCase(),
    actionUrl: String(req.body.actionUrl || '').trim(),
    expiresAt: req.body.expiresAt || null,
    createdBy: req.userId,
  })
  return res.status(201).json({ success: true, error: false, message: 'Notification published', data: notification })
})

const markNotificationReadController = asyncHandler(async (req, res) => {
  const notification = await notificationModel.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.userId } }, { new: true })
  if (!notification) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Notification marked as read' })
})

const markAllNotificationsReadController = asyncHandler(async (req, res) => {
  const user = req.adminUser || await userModel.findById(req.userId).select('role').lean()
  const audiences = req.adminUser ? ['STAFF', 'CUSTOMERS', 'ALL'] : user?.role && user.role !== 'USER' ? ['STAFF', 'ALL'] : ['CUSTOMERS', 'ALL']
  await notificationModel.updateMany({ audience: { $in: audiences } }, { $addToSet: { readBy: req.userId } })
  return res.json({ success: true, error: false, message: 'All notifications marked as read' })
})

const deleteNotificationController = asyncHandler(async (req, res) => {
  const notification = await notificationModel.softDeleteOne(
    { _id: req.params.id },
    { deletedBy: req.userId },
  )
  if (!notification) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Notification deleted' })
})

const listUserNotificationsController = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.userId).select('role').lean()
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  const staff = user.role !== 'USER'
  const now = new Date()
  const notifications = await notificationModel.find({
    audience: { $in: staff ? ['STAFF', 'ALL'] : ['CUSTOMERS', 'ALL'] },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).select('title message type audience actionUrl readBy createdAt').sort({ createdAt: -1 }).limit(30).lean()
  const data = notifications.map((item) => ({ ...item, isRead: item.readBy.some((id) => String(id) === String(req.userId)), readBy: undefined }))
  return res.json({ success: true, error: false, data, unread: data.filter((item) => !item.isRead).length })
})

module.exports = { listNotificationsController, createNotificationController, markNotificationReadController, markAllNotificationsReadController, deleteNotificationController, listUserNotificationsController }
