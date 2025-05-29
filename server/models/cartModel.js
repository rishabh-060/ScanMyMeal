const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    product : {
        type : mongoose.Schema.ObjectId,
        ref : "product"
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    },
    quantity : {
        type : Number,
        default : 1
    }
},{
    timestamps : true
})

module.exports = mongoose.model('cartProduct', cartSchema)