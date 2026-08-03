const bcryptjs = require('bcryptjs')
const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const { ROLE_PERMISSIONS, STAFF_ROLES, ALL_PERMISSIONS, permissionsFor } = require('../constants/permissions')

const STAFF_FIELDS = 'name email avatar mobile role permissions status verify_email accountType staffCreatedBy last_login_date createdAt updatedAt'

const publicStaff = (staff) => {
  const value = staff.toObject ? staff.toObject() : staff
  return {
    _id: value._id,
    name: value.name,
    email: value.email,
    avatar: value.avatar,
    mobile: value.mobile,
    role: value.role,
    permissions: value.permissions || [],
    status: value.status,
    verify_email: value.verify_email,
    accountType: 'STAFF',
    staffCreatedBy: value.staffCreatedBy || null,
    last_login_date: value.last_login_date,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

const normalizedPermissions = (value) => {
  const permissions = [...new Set(Array.isArray(value) ? value : [])]
  if (permissions.some((permission) => !ALL_PERMISSIONS.includes(permission))) {
    throw new AppError('One or more permissions are invalid', 400, 'INVALID_PERMISSION')
  }
  return permissions
}

const normalizedRole = (value) => {
  const role = String(value || '').toUpperCase()
  if (!STAFF_ROLES.includes(role)) throw new AppError('Select a valid staff role', 400, 'INVALID_ROLE')
  return role
}

const assertCanAssign = (actor, role, permissions) => {
  const actorPermissions = permissionsFor(actor)
  if (actorPermissions.includes('*')) return
  const defaults = ROLE_PERMISSIONS[role] || []
  if (defaults.includes('*') || [...defaults, ...permissions].some((permission) => !actorPermissions.includes(permission))) {
    throw new AppError('You cannot grant access that you do not have', 403, 'PRIVILEGE_ESCALATION')
  }
}

const protectLastAdmin = async (target, role, status) => {
  if (target.role !== 'ADMIN' || (role === 'ADMIN' && status === 'Active')) return
  const activeAdmins = await userModel.countDocuments({ role: 'ADMIN', status: 'Active' })
  if (activeAdmins <= 1) throw new AppError('At least one active administrator is required', 409, 'LAST_ADMIN_REQUIRED')
}

const listAccessController = asyncHandler(async (_req, res) => {
  const staff = await userModel.find({ role: { $in: STAFF_ROLES } })
    .select(STAFF_FIELDS)
    .populate('staffCreatedBy', 'name email')
    .sort({ role: 1, name: 1 })
    .limit(250)
    .lean()
  return res.json({
    success: true,
    error: false,
    data: {
      staff,
      roles: Object.entries(ROLE_PERMISSIONS).filter(([role]) => role !== 'USER').map(([role, permissions]) => ({ role, permissions })),
      permissions: ALL_PERMISSIONS,
    },
  })
})

const createStaffController = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const role = normalizedRole(req.body.role)
  const permissions = role === 'ADMIN' ? [] : normalizedPermissions(req.body.permissions)
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    throw new AppError('Name, valid email, and an 8-character password are required', 400, 'INVALID_STAFF_ACCOUNT')
  }
  assertCanAssign(req.adminUser, role, permissions)
  if (await userModel.findOne({ email }).withDeleted()) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS')
  const staff = await userModel.create({
    name,
    email,
    password: await bcryptjs.hash(password, 12),
    mobile: req.body.mobile === '' || req.body.mobile == null ? null : Number(req.body.mobile),
    role,
    permissions,
    accountType: 'STAFF',
    staffCreatedBy: req.userId,
    verify_email: true,
    status: 'Active',
  })
  return res.status(201).json({ success: true, error: false, message: 'Staff account created and verified', data: publicStaff(staff) })
})

const updateAccessController = asyncHandler(async (req, res) => {
  if (String(req.params.userId) === String(req.userId)) {
    throw new AppError('You cannot change your own access from this screen', 409, 'SELF_ACCESS_CHANGE')
  }
  const target = await userModel.findOne({ _id: req.params.userId, role: { $in: STAFF_ROLES } })
  if (!target) throw new AppError('Staff member not found', 404, 'STAFF_NOT_FOUND')
  const role = normalizedRole(req.body.role)
  const permissions = role === 'ADMIN' ? [] : normalizedPermissions(req.body.permissions)
  const status = String(req.body.status || target.status)
  if (!['Active', 'Suspended'].includes(status)) throw new AppError('Invalid staff status', 400, 'INVALID_STATUS')
  const name = String(req.body.name || target.name).trim()
  const email = String(req.body.email || target.email).trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || (password && password.length < 8)) {
    throw new AppError('Provide a name, valid email, and an optional password of at least 8 characters', 400, 'INVALID_STAFF_ACCOUNT')
  }
  if (email !== target.email && await userModel.findOne({ email, _id: { $ne: target._id } }).withDeleted()) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS')
  }
  assertCanAssign(req.adminUser, role, permissions)
  await protectLastAdmin(target, role, status)
  target.name = name
  target.email = email
  target.mobile = req.body.mobile === '' || req.body.mobile == null ? null : Number(req.body.mobile)
  target.role = role
  target.permissions = permissions
  target.status = status
  target.accountType = 'STAFF'
  target.verify_email = true
  if (password) target.password = await bcryptjs.hash(password, 12)
  if (status !== 'Active') target.refresh_token = ''
  await target.save()
  return res.json({ success: true, error: false, message: 'Staff access updated', data: publicStaff(target) })
})

module.exports = { listAccessController, createStaffController, updateAccessController }
