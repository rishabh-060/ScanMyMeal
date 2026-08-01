const { Router } = require('express')
const { registerUserController, loginController, verifyEmail, logoutController, updateUserDetails, forgetPasswordController, verifyForgotPasswordOTP, resetPassword, refreshTokenController, userDetails, uploadAvatar, resendVerificationMail } = require('../controllers/userController')
const auth = require('../middlewares/auth')
const upload = require('../middlewares/multer')
const { createRateLimiter } = require('../middlewares/rateLimit')
const { listUserNotificationsController, markNotificationReadController, markAllNotificationsReadController } = require('../controllers/notificationController')


const userRouter = Router()

const authLimiter = createRateLimiter({ scope: 'authentication', limit: 10, windowMs: 15 * 60_000 })
const otpLimiter = createRateLimiter({ scope: 'otp', limit: 5, windowMs: 15 * 60_000 })

userRouter.post('/register', authLimiter, registerUserController)
userRouter.post('/verify-email', verifyEmail)
userRouter.post('/login', authLimiter, loginController)
userRouter.get('/logout', auth, logoutController)
userRouter.post('/logout', auth, logoutController)
userRouter.put('/upload-avatar', auth, upload.single('avatar'), uploadAvatar)
userRouter.put('/update-user', auth, updateUserDetails )
userRouter.put('/forgot-password', otpLimiter, forgetPasswordController)
userRouter.put('/verify-forgot-password-otp', otpLimiter, verifyForgotPasswordOTP)
userRouter.put('/reset-password', resetPassword)
userRouter.post('/refresh-token', refreshTokenController)
userRouter.get('/user-details', auth, userDetails)
userRouter.get('/notifications', auth, listUserNotificationsController)
userRouter.patch('/notifications/read-all', auth, markAllNotificationsReadController)
userRouter.patch('/notifications/:id/read', auth, markNotificationReadController)
userRouter.post('/send-verification-mail', otpLimiter, resendVerificationMail);

module.exports = userRouter
