const { Router } = require('express')
const auth = require('../middlewares/auth')
const { createProductController, getAllProductsController, getProductByCategoryController, getProductbySubcategory, getProductDetailsController, updateProductController, deleteProductController, searchProductController } = require('../controllers/productController')
const admin = require('../middlewares/Admin')

const productRouter = Router()


productRouter.post('/add-product', auth, admin, createProductController)
productRouter.post('/get-product', getAllProductsController)
productRouter.post('/get-product-by-category', getProductByCategoryController)
productRouter.post('/get-product-by-category-subcategory', getProductbySubcategory)
productRouter.post('/get-product-details', getProductDetailsController)
productRouter.put('/update-product', auth, admin, updateProductController)
productRouter.delete('/delete-product', auth, admin, deleteProductController)
productRouter.post('/search-product', searchProductController)

module.exports = productRouter