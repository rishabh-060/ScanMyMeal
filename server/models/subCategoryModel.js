const mongoose = require('mongoose')

const subCategorySchema = new mongoose.Schema({
    name : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ]
}, {
    timestamps : true
})

module.exports = mongoose.model('subCategory', subCategorySchema)