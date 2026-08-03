const userModel = require('../models/userModel')
const { STAFF_ROLES, hasPermission } = require('../constants/permissions')

const Admin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId).select('role permissions status verify_email').lean()
    if (!user || !STAFF_ROLES.includes(user.role) || user.status !== 'Active' || !user.verify_email) {
      return res.status(403).json({ success: false, error: true, message: 'Admin access required', code: 'ADMIN_REQUIRED' })
    }
    req.adminUser = user
    return next()
  } catch (error) {
    return next(error)
  }
}

const requirePermission = (permission) => (req, res, next) => {
  if (!hasPermission(req.adminUser, permission)) {
    return res.status(403).json({ success: false, error: true, message: 'You do not have permission to perform this action', code: 'PERMISSION_DENIED' })
  }
  return next()
}

const requireAnyPermission = (...permissions) => (req, res, next) => {
  if (!permissions.some((permission) => hasPermission(req.adminUser, permission))) {
    return res.status(403).json({ success: false, error: true, message: 'You do not have permission to perform this action', code: 'PERMISSION_DENIED' })
  }
  return next()
}

module.exports = Admin
module.exports.requirePermission = requirePermission
module.exports.requireAnyPermission = requireAnyPermission
