const mongoose = require('mongoose')
require('dotenv').config()

const dbConn = mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
}).then((res) => {
    console.log('DB connected succesfully', res.connection.host)
}).catch((error) => {
    console.log('Error occured during DB Connection: ', error)
})

module.exports = dbConn