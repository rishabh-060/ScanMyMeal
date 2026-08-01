const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

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
cartSchema.plugin(softDeletePlugin)

module.exports = mongoose.model('cartProduct', cartSchema)
