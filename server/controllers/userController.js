const userModel = require('../models/userModel')
const bcryptjs = require('bcryptjs')
const generatedAccessToken = require('../utils/generateAccessToken')
const generatedRefreshToken = require('../utils/generateRefreshToken')
const generateOtp = require('../utils/geerateOTP')
const jwt = require('jsonwebtoken')
const verifyEmailTemplate = require('../templates/verifyEmailTemplate')
const sendMail = require('../helpers/tryMailer')
const sentOtpTemplate = require('../templates/sentOtpTemplate')
const uploadImageCloudinary = require('../utils/uploadImageCloudinary')


// Signup controller
const registerUserController = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if(!name || !email || !password) {
            return res.status(400).json({
                message : "Please fill all required fields",
                error : true,
                success : false
            })
        }

        const users = await userModel.findOne({email})

        if(users) {
            return res.status(400).json({
                message : "Email already registered",
                error : true,
                success : false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedpass = await bcryptjs.hash(password, salt)

        
        const newUser = await userModel({...req.body, password : hashedpass})
        const save = await newUser.save()

        const url = `https://scanmymeal.netlify.app/verify-email?code=${save?._id}` 

        // const isSend = await sendMail(
        sendMail(
            email,
            'Welcome to Scan My Meal',
            'Mail Verification | Scan My Meal',
            verifyEmailTemplate( name, url)
        )

        // if(isSend.success){
            return res.status(200).json({
                message : "Verification mail sent successfully",
                error : false,
                success : true,
                data : save
            })
        // }else{
        //     await userModel.findByIdAndDelete(save?._id)
        //     return res.status(400).json({
        //         message : "Something went wrong ! Try again",
        //         error : true,
        //         success : false
        //     })
        // }
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Mail verification controller
const verifyEmail = async (req, res) => {
    try {
        const { code } = req.body;

        const user = await userModel.findOne({_id : code})

        if(!user) {
            return res.status(400).json({
                message : "Invalid Code",
                error : true,
                success : false
            })
        }

        const updateUser = await userModel.updateOne({ _id : code }, {
            verify_email : true
        })

        return res.status(200).json({
            message : "Email Verified",
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Login controller
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body

        if( !email || !password ){
            return res.status(400).json({
                message : "All fields are required",
                error : true,
                success : false
            })
        }

        const user = await userModel.findOne({ email })

        if(!user) {
            return res.status(400).json({
                message : "Email not registered",
                error : true,
                success : false
            })
        }

        const verifyPass = await bcryptjs.compare(password, user.password)

        if(!verifyPass) {
            return res.status(400).json({
                message : `Wrong Password Entered`,
                error : true,
                success : false
            })
        }
        
        if(user.status == "Inactive" || user.status == "Suspended") {
            return res.status(400).json({
                message : `Account ${user.status}! Can't login`,
                error : true,
                success : false
            })
        }
        
        if(!user?.verify_email) {
            return res.status(403).json({
                message : `Email not verified! Can't login`,
                error : true,
                success : false,
                email : user.email
            })
        }

        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        const updateUser = await userModel.findByIdAndUpdate(user?._id, {
            last_login_date : new Date()
        })

        const cookieOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        res.cookie('accesstoken', accessToken, cookieOption)
        res.cookie('refreshtoken', refreshToken, cookieOption)

        return res.status(200).json({
            message : `Login Successfully`,
            error : false,
            success : true,
            data : {
                accessToken,
                refreshToken
            }
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Logout controller
const logoutController = async (req, res) => {
    try {
        const userId = req.userId //from auth middleware

        const cookieOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        
        res.clearCookie("accesstoken", cookieOption)
        res.clearCookie("refreshtoken", cookieOption)

        const removeRefreshToken = await userModel.findByIdAndUpdate(userId, {
            refresh_token : ''
        })

        return res.status(200).json({
            message : "Logout Successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// upload user avatar controller
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.userId // from auth middleware
        const image = req.file // from multer middleware

        const upload = await uploadImageCloudinary(image)

        const updateUser = await userModel.findByIdAndUpdate(userId, {
            avatar : upload.url
        })
        return res.status(200).json({
            message : 'Profile changed successfully',
            data : {
                id : userId,
                avatar : upload.url
            },
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
} 

// update user details controller
const updateUserDetails = async (req, res) => {
    try {
        const userId = req.userId // from auth middleware

        const { name, mobile, password } = req.body

        let hashedpass = ''
        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashedpass = await bcryptjs.hash(password, salt)
        }

        const updateUser = await userModel.updateOne({ _id : userId }, {
            ...( name && { name : name }),
            ...( mobile && { mobile : mobile }),
            ...( password && { password : hashedpass })
        })

        return res.status(200).json({
            message : 'User details updated successfully',
            error : false,
            success : true,
            data : updateUser
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// forgot password without loggedIn controller
const forgetPasswordController = async (req, res) => {
    try {
        const { email } = req.body

        const user = await userModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : 'Email not registered',
                error : true,
                success : false
            })
        }

        const otp = await generateOtp()
        const expireTime = new Date() + 60 * 1000 * 10 // 10min

        const update = await userModel.findByIdAndUpdate(user._id, {
            forgot_password_otp : otp,
            forgot_password_expiry : expireTime
        })
        
        const isSend = await sendMail(
            email,
            'Scan My Meal',
            'Frogot Password OTP',
            sentOtpTemplate(user.name, otp)
        )

        if(isSend.success){
            return res.status(200).json({
                message : 'OTP send successfully, Check Your Mail Box',
                error : false,
                success : true
            })
        }else{
            return res.status(400).json({
                message : "Something went wrong ! Try again",
                error : true,
                success : false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false,
            otp : generateOtp()
        })
    }
}

// verify forgot password otp controller
const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body
        if( !email ) {
            return res.status(400).json({
                message : 'Email required',
                error : true,
                success : false
            })
        }
        
        if( !otp ) {
            return res.status(400).json({
                message : 'OTP required',
                error : true,
                success : false
            })
        }

        const user = await userModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : 'Email not registered',
                error : true,
                success : false
            })
        }

        const currentTime = new Date()

        if(user.forgot_password_expiry > currentTime){

            const updateUser = await userModel.findByIdAndUpdate(user?._id, {
                forgot_password_otp : null,
                forgot_password_expiry : null
            })
            
            return res.status(400).json({
                message : 'OTP expired',
                error : true,
                success : false
            })
        }


        if(user.forgot_password_otp !== otp){
            return res.status(400).json({
                message : 'OTP not matched',
                error : true,
                success : false
            })
        }

        const updateUser = await userModel.findByIdAndUpdate(user?._id, {
            forgot_password_otp : null,
            forgot_password_expiry : null
        })

        return res.status(200).json({
            message : 'type new password',
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// reset password controller
const resetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body
        if( !email || !password || !confirmPassword) {
            return res.status(400).json({
                message : 'Fill all required fields',
                error : true,
                success : false
            })
        }

        const user = await userModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : 'Email not registered',
                error : true,
                success : false
            })
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                message : 'New password & confirm password must be same',
                error : true,
                success : false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedpass = await bcryptjs.hash(confirmPassword, salt)

        const updatePass = await userModel.findByIdAndUpdate(user._id, { password : hashedpass })

        return res.status(200).json({
            message : 'Password changed successfully',
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// refresh token controller
const refreshTokenController = async (req, res) => {
    try {
        const refresh_token = req.cookies.refreshtoken || req?.headers?.authorization?.split(" ")[1]

        if(!refresh_token) {
            return res.status(400).json({
                message : "Invalid token",
                error : true,
                success : false
            })
        }

        const verifyToken = await jwt.sign(refresh_token, process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken) {
            return res.status(401).json({
                message : "Token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id
        const newAccessToken = await generatedAccessToken(userId)

        const cookieOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        res.cookie('accesstoken', newAccessToken, cookieOption)

        return res.status(200).json({
            message : "New access token generated",
            error : false,
            success : true,
            data : {
                accesstoken : newAccessToken
            }
        })
    } catch (error) {
        res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// get user details
const userDetails = async (req, res) => {
    try {
        const userId = req.userId

        if(!userId) {
            return res.status(400).json({
                message : 'Login required',
                error : true,
                success : false
            })
        }

        const user = await userModel.findById(userId).select('-password -refreshToken -forgot_password_otp')

        return res.status(200).json({
            message : 'user details',
            error : false,
            success : true,
            data : user
        })
    } catch (error) {
        res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// resend verification Mail
const resendVerificationMail = async (req, res) => {
    try {
        const { email } = req.body;
    
        if(!email) {
            return res.status(400).json({
                message : "Something went wrong! try again with login",
                error : true,
                success : false
            })
        }

        const user = await userModel.findOne({ email });

        if(!user._id) {
            return res.status(400).json({
                message : "Something went wrong! try again with login",
                error : true,
                success : false
            })
        }

        const url = `https://scanmymeal.netlify.app/verify-email?code=${user?._id}` 

        await sendMail(
            user.email,
            'Welcome to Scan My Meal',
            'Mail Verification | Scan My Meal',
            verifyEmailTemplate( user.name, url)
        )

        return res.status(200).json({
            message : "Verification mail sent successfully",
            error : false,
            success : true
        })
    } catch (error) {
        res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

module.exports = { registerUserController, loginController, verifyEmail, logoutController, uploadAvatar, updateUserDetails, forgetPasswordController, verifyForgotPasswordOTP, resetPassword, refreshTokenController, userDetails, resendVerificationMail }