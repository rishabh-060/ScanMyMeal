const { Router } = require('express')
const { registerUserController, loginController, verifyEmail, logoutController, updateUserDetails, forgetPasswordController, verifyForgotPasswordOTP, resetPassword, refreshTokenController, userDetails, uploadAvatar, resendVerificationMail } = require('../controllers/userController')
const auth = require('../middlewares/auth')
const upload = require('../middlewares/multer')


const userRouter = Router()

userRouter.post('/register', registerUserController)
userRouter.post('/verify-email', verifyEmail)
userRouter.post('/login', loginController)
userRouter.get('/logout', auth, logoutController)
userRouter.put('/upload-avatar', auth, upload.single('avatar'), uploadAvatar)
userRouter.put('/update-user', auth, updateUserDetails )
userRouter.put('/forgot-password', forgetPasswordController)
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOTP)
userRouter.put('/reset-password', resetPassword)
userRouter.post('/refresh-token', refreshTokenController)
userRouter.get('/user-details', auth, userDetails)
userRouter.post('/send-verification-mail', resendVerificationMail);

module.exports = userRouter