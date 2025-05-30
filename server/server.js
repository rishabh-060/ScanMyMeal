const express = require('express')
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const dbConn = require('./config/conn')
const userRouter = require('./routes/userRoute')
const categoryRouter = require('./routes/categoryRoute')
const uploadRouter = require('./routes/uploadRouter')
const { subCategoryRouter } = require('./routes/subCategoryRoute')
const productRouter = require('./routes/productRouter')
const { cartRouter } = require('./routes/cartRoute')
const { addressRouter } = require('./routes/addressRoute')
const { orderRouter } = require('./routes/orderRouter')
const adminRouter = require('./routes/adminRouter')

const app = express()
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : true
}))

PORT = process.env.PORT

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use('/api/sub-category', subCategoryRouter)
app.use('/api/file', uploadRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)
app.use('/api/admin', adminRouter)


app.listen(PORT)