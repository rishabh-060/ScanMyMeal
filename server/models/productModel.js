const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name : {
        type : String
    },
    image : {
        type : [String],
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : 0
    },
    price : {
        type : Number,
        default : null
    },
    discount : {
        type : String,
        default : null
    },
    description : {
        type : String,
        default : ""
    },
    more_details : {
        type : Object,
        default : {}
    },
    publish : {
        type : Boolean,
        default : true
    }
}, {
    timestamps : true
})


productSchema.index({ name: 'text', description: 'text'  },{
    name: 10,
    description: 5
})

module.exports = mongoose.model('product', productSchema)