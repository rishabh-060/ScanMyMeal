const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { ROLE_PERMISSIONS, STAFF_ROLES, ALL_PERMISSIONS } = require('../constants/permissions')

const listAccessController = asyncHandler(async (_req, res) => {
  const users = await userModel.find()
    .select('name email avatar role permissions status last_login_date createdAt')
    .sort({ role: 1, name: 1 })
    .limit(250)
    .lean()
  return res.json({
    success: true,
    error: false,
    data: {
      users,
      roles: Object.entries(ROLE_PERMISSIONS).filter(([role]) => role !== 'USER').map(([role, permissions]) => ({ role, permissions })),
      permissions: ALL_PERMISSIONS,
    },
  })
})

const updateAccessController = asyncHandler(async (req, res) => {
  if (String(req.params.userId) === String(req.userId)) {
    throw new AppError('You cannot change your own access from this screen', 409, 'SELF_ACCESS_CHANGE')
  }
  const role = String(req.body.role || '').toUpperCase()
  if (![...STAFF_ROLES, 'USER'].includes(role)) throw new AppError('Invalid role', 400, 'INVALID_ROLE')
  const permissions = [...new Set(Array.isArray(req.body.permissions) ? req.body.permissions : [])]
  if (permissions.some((permission) => !ALL_PERMISSIONS.includes(permission))) {
    throw new AppError('One or more permissions are invalid', 400, 'INVALID_PERMISSION')
  }
  const user = await userModel.findByIdAndUpdate(
    req.params.userId,
    { $set: { role, permissions: role === 'USER' ? [] : permissions } },
    { new: true, runValidators: true },
  ).select('name email avatar role permissions status last_login_date createdAt')
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Access updated', data: user })
})

module.exports = { listAccessController, updateAccessController }
