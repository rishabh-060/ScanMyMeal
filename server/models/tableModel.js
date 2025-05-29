const mongoose = require('mongoose')

const tableSchema = new mongoose.Schema({
    table_no : {
        type : String,
        default : null
    },
    booked : {
        type : Boolean,
        default : false
    },
    userId : {
        type : mongoose.Schema.ObjectId,
        ref : "User"
    },
    status : {
        type : Boolean,
        default : true,
    }
}, {
    timestamps : true
})

module.exports = mongoose.model('table', tableSchema)