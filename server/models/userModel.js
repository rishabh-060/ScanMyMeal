const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Provide Name']
    },
    email : {
        type : String,
        required : [true, 'Provide Email'],
        unique : true
    },
    password : {
        type : String,
        required : [true, 'Provide Password']
    },
    avatar : {
        type : String,
        default : 'https://img.freepik.com/free-vector/man-profile-account-picture_24908-81754.jpg?semt=ais_hybrid&w=740'
    },
    mobile : {
        type : Number,
        default : null
    },
    refresh_token : {
        type : String,
        default : ""
    },
    verify_email : {
        type : Boolean,
        default : false
    },
    last_login_date : {
        type : Date,
        default : ""
    },
    status : {
        type : String,
        enum : ["Active", "Inactive", "Suspended"],
        default : "Active"
    },
    address_details : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'address'
        }
    ],
    shopping_cart : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'cartProduct'
        }
    ],
    order_history : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'order'
        }
    ],
    forgot_password_otp : {
        type : String,
        default : null
    },
    forgot_password_expiry : {
        type : Date,
        default : ""
    },
    password_reset_token_hash : {
        type : String,
        default : null,
        select : false
    },
    password_reset_expiry : {
        type : Date,
        default : null,
        select : false
    },
    role : {
        type : String,
        enum : ["ADMIN", "MANAGER", "KITCHEN", "SUPPORT", "MARKETING", "USER"],
        default : "USER"
    },
    permissions : {
        type : [String],
        default : []
    }
},{
    timestamps : true
})

userSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('User', userSchema)
