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
        default : 1,
        min : 1
    }
},{
    timestamps : true
})

cartSchema.index({ userId: 1, product: 1 }, { unique: true })

module.exports = mongoose.model('cartProduct', cartSchema)
