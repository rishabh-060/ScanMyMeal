const { randomBytes } = require('crypto')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const generatedAccessToken = require('../utils/generateAccessToken')
const generatedRefreshToken = require('../utils/generateRefreshToken')
const generateOtp = require('../utils/geerateOTP')
const hashToken = require('../utils/tokenHash')
const verifyEmailTemplate = require('../templates/verifyEmailTemplate')
const sentOtpTemplate = require('../templates/sentOtpTemplate')
const sendMail = require('../helpers/tryMailer')
const uploadImageCloudinary = require('../utils/uploadImageCloudinary')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')
const logger = require('../utils/logger')

const accessSecret = () => process.env.SECRET_KEY_ACCESS_TOKEN
const refreshSecret = () => process.env.SECRET_KEY_REFRESH_TOKEN
const emailSecret = accessSecret
const clientUrl = () => process.env.FRONTEND_URL

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge,
})

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  mobile: user.mobile,
  verify_email: user.verify_email,
  last_login_date: user.last_login_date,
  status: user.status,
  role: user.role,
  accountType: user.role === 'USER' ? 'CUSTOMER' : 'STAFF',
  permissions: user.permissions || [],
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const sendVerificationEmail = async (user) => {
  const code = jwt.sign({ id: String(user._id), type: 'email-verification' }, emailSecret(), {
    expiresIn: '24h',
    issuer: 'scanmymeal',
  })
  const url = `${clientUrl()}/verify-email?code=${encodeURIComponent(code)}`
  return sendMail(user.email, 'Welcome to Scan My Meal', 'Email verification', verifyEmailTemplate(user.name, url))
}

const registerUserController = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    throw new AppError('Name, valid email, and an 8-character password are required', 400, 'INVALID_REGISTRATION')
  }
  if (await userModel.exists({ email })) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS')
  const user = await userModel.create({ name, email, password: await bcryptjs.hash(password, 12), accountType: 'CUSTOMER' })
  void sendVerificationEmail(user)
  return res.status(201).json({
    success: true,
    error: false,
    message: 'Account created. Check your email to verify it.',
    data: publicUser(user),
  })
})

const verifyEmail = asyncHandler(async (req, res) => {
  let decoded
  try {
    decoded = jwt.verify(String(req.body.code || ''), emailSecret(), { issuer: 'scanmymeal' })
  } catch (_error) {
    throw new AppError('Verification link is invalid or expired', 400, 'INVALID_VERIFICATION_LINK')
  }
  if (decoded.type !== 'email-verification') throw new AppError('Invalid verification link', 400, 'INVALID_VERIFICATION_LINK')
  const user = await userModel.findByIdAndUpdate(decoded.id, { $set: { verify_email: true } }, { new: true })
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'Email verified' })
})

const loginController = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const user = await userModel.findOne({ email })
  const validPassword = user ? await bcryptjs.compare(password, user.password) : false
  if (!user || !validPassword) {
    logger.warn('login_failed', { email, requestId: req.requestId })
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }
  if (user.status !== 'Active') throw new AppError(`Account ${user.status.toLowerCase()}`, 403, 'ACCOUNT_RESTRICTED')
  if (!user.verify_email) {
    return res.status(403).json({ success: false, error: true, message: 'Email verification required', code: 'EMAIL_NOT_VERIFIED', email: user.email })
  }
  const accessToken = generatedAccessToken(user._id)
  const refreshToken = await generatedRefreshToken(user._id)
  user.last_login_date = new Date()
  await user.save()
  res.cookie('accesstoken', accessToken, cookieOptions(15 * 60 * 1000))
  res.cookie('refreshtoken', refreshToken, cookieOptions(30 * 24 * 60 * 60 * 1000))
  return res.json({ success: true, error: false, message: 'Login successful', data: publicUser(user) })
})

const logoutController = asyncHandler(async (req, res) => {
  await userModel.updateOne({ _id: req.userId }, { $set: { refresh_token: '' } })
  res.clearCookie('accesstoken', cookieOptions())
  res.clearCookie('refreshtoken', cookieOptions())
  return res.json({ success: true, error: false, message: 'Logout successful' })
})

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Avatar image is required', 400, 'FILE_REQUIRED')
  const uploaded = await uploadImageCloudinary(req.file)
  const user = await userModel.findByIdAndUpdate(req.userId, { $set: { avatar: uploaded.secure_url || uploaded.url } }, { new: true })
  return res.json({ success: true, error: false, message: 'Profile image updated', data: publicUser(user) })
})

const updateUserDetails = asyncHandler(async (req, res) => {
  const updates = {}
  if (req.body.name !== undefined) updates.name = String(req.body.name).trim()
  if (req.body.mobile !== undefined) updates.mobile = Number(req.body.mobile)
  if (req.body.password) {
    if (String(req.body.password).length < 8) throw new AppError('Password must contain at least 8 characters', 400, 'WEAK_PASSWORD')
    updates.password = await bcryptjs.hash(String(req.body.password), 12)
  }
  const user = await userModel.findByIdAndUpdate(req.userId, { $set: updates }, { new: true, runValidators: true })
  return res.json({ success: true, error: false, message: 'User details updated', data: publicUser(user) })
})

const forgetPasswordController = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const user = await userModel.findOne({ email })
  if (user) {
    const otp = await generateOtp()
    user.forgot_password_otp = hashToken(otp)
    user.forgot_password_expiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()
    void sendMail(email, 'Scan My Meal password reset', 'Password reset OTP', sentOtpTemplate(user.name, otp))
  }
  return res.json({ success: true, error: false, message: 'If the email is registered, an OTP has been sent.' })
})

const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const otp = String(req.body.otp || '')
  const user = await userModel.findOne({ email }).select('+password_reset_token_hash +password_reset_expiry')
  if (!user || !user.forgot_password_expiry || user.forgot_password_expiry <= new Date() || user.forgot_password_otp !== hashToken(otp)) {
    throw new AppError('OTP is invalid or expired', 400, 'INVALID_OTP')
  }
  const resetToken = randomBytes(32).toString('hex')
  user.forgot_password_otp = null
  user.forgot_password_expiry = null
  user.password_reset_token_hash = hashToken(resetToken)
  user.password_reset_expiry = new Date(Date.now() + 15 * 60 * 1000)
  await user.save()
  return res.json({ success: true, error: false, message: 'OTP verified', data: { resetToken } })
})

const resetPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (password.length < 8 || password !== String(req.body.confirmPassword || '')) {
    throw new AppError('Passwords must match and contain at least 8 characters', 400, 'INVALID_PASSWORD')
  }
  const user = await userModel.findOne({ email }).select('+password_reset_token_hash +password_reset_expiry')
  if (!user || !user.password_reset_expiry || user.password_reset_expiry <= new Date() || user.password_reset_token_hash !== hashToken(req.body.resetToken || '')) {
    throw new AppError('Password reset request is invalid or expired', 400, 'INVALID_RESET_TOKEN')
  }
  user.password = await bcryptjs.hash(password, 12)
  user.password_reset_token_hash = null
  user.password_reset_expiry = null
  user.refresh_token = ''
  await user.save()
  return res.json({ success: true, error: false, message: 'Password changed successfully' })
})

const refreshTokenController = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshtoken || req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) throw new AppError('Refresh token required', 401, 'REFRESH_REQUIRED')
  let decoded
  try {
    decoded = jwt.verify(token, refreshSecret(), { issuer: 'scanmymeal' })
  } catch (_error) {
    throw new AppError('Refresh token is invalid or expired', 401, 'INVALID_REFRESH_TOKEN')
  }
  const user = await userModel.findById(decoded.id)
  if (!user || user.refresh_token !== hashToken(token) || user.status !== 'Active') {
    throw new AppError('Refresh token was revoked', 401, 'REFRESH_REVOKED')
  }
  const accessToken = generatedAccessToken(user._id)
  res.cookie('accesstoken', accessToken, cookieOptions(15 * 60 * 1000))
  return res.json({ success: true, error: false, message: 'Session refreshed' })
})

const userDetails = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.userId)
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  return res.json({ success: true, error: false, message: 'User details', data: publicUser(user) })
})

const resendVerificationMail = asyncHandler(async (req, res) => {
  const user = await userModel.findOne({ email: String(req.body.email || '').trim().toLowerCase() })
  if (user && !user.verify_email) void sendVerificationEmail(user)
  return res.json({ success: true, error: false, message: 'If verification is required, a new email has been sent.' })
})

module.exports = {
  registerUserController,
  loginController,
  verifyEmail,
  logoutController,
  uploadAvatar,
  updateUserDetails,
  forgetPasswordController,
  verifyForgotPasswordOTP,
  resetPassword,
  refreshTokenController,
  userDetails,
  resendVerificationMail,
}
