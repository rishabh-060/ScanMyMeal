const { Router } = require('express')
const auth = require('../middlewares/auth')
const { addCategoryController, getCategoryController, updateCategoryController, deleteCategoryController } = require('../controllers/categoryController')
const admin = require('../middlewares/Admin')
const { requirePermission } = require('../middlewares/Admin')
const { PERMISSIONS } = require('../constants/permissions')

const categoryRouter = Router()


categoryRouter.post('/add-category', auth, admin, requirePermission(PERMISSIONS.PRODUCTS_MANAGE), addCategoryController)
categoryRouter.get('/get-category', getCategoryController)
categoryRouter.put('/update-category', auth, admin, requirePermission(PERMISSIONS.PRODUCTS_MANAGE), updateCategoryController)
categoryRouter.delete('/delete-category', auth, admin, requirePermission(PERMISSIONS.PRODUCTS_MANAGE), deleteCategoryController)


module.exports = categoryRouter
