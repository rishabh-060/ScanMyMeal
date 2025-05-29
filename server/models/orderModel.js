const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    },
    orderId : {
        type : String,
        required : [true, "Provide orderId"],
        unique : true
    },
    productId : {
        type : mongoose.Schema.ObjectId,
        ref : 'product'
    },
    order_status : {
        type : String,
        default : "pending",
        enum : ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]
    },
    product_details : {
        name : String,
        image : Array,
    },
    paymentId : {
        type : String,
        default : ""
    },
    payment_status : {
        type : String,
        default : ""
    },
    delivery_address : {
        type : mongoose.Schema.ObjectId,
        ref : "address"
    },
    table_num : {
        type : mongoose.Schema.ObjectId,
        ref : "table"
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0
    },
    invoice_receipt : {
        type : String,
        default : ""
    }
}, {
    timestamps : true
})

module.exports = mongoose.model('order', orderSchema)