const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

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

subCategorySchema.plugin(softDeletePlugin)

module.exports = mongoose.model('subCategory', subCategorySchema)
