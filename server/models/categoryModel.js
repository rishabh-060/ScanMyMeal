const mongoose = require('mongoose')
const softDeletePlugin = require('./plugins/softDeletePlugin')

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    }
}, {
    timestamps : true
})

categorySchema.plugin(softDeletePlugin)

module.exports = mongoose.model('category', categorySchema)
