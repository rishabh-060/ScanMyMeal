const { Router } = require('express')
const auth = require('../middlewares/auth')
const { addSubcategoryController, getSubcategoryController, editSubCategoryController, deleteSubCategoryController } = require('../controllers/subCategoryController')
const admin = require('../middlewares/Admin')
const { requirePermission } = require('../middlewares/Admin')
const { PERMISSIONS } = require('../constants/permissions')

const subCategoryRouter = Router()

subCategoryRouter.post('/add-subcategory', auth, admin, requirePermission(PERMISSIONS.PRODUCTS_MANAGE), addSubcategoryController)
subCategoryRouter.post('/get-subcategory', getSubcategoryController)
subCategoryRouter.put('/edit-subcategory', auth, admin, requirePermission(PERMISSIONS.PRODUCTS_MANAGE), editSubCategoryController)
subCategoryRouter.delete('/delete-subcategory', auth, admin, requirePermission(PERMISSIONS.PRODUCTS_MANAGE), deleteSubCategoryController)

module.exports = { subCategoryRouter }
