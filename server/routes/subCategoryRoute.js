const { Router } = require('express')
const auth = require('../middlewares/auth')
const { addSubcategoryController, getSubcategoryController, editSubCategoryController, deleteSubCategoryController } = require('../controllers/subCategoryController')

const subCategoryRouter = Router()

subCategoryRouter.post('/add-subcategory', auth, addSubcategoryController)
subCategoryRouter.post('/get-subcategory', getSubcategoryController)
subCategoryRouter.put('/edit-subcategory', auth, editSubCategoryController)
subCategoryRouter.delete('/delete-subcategory', auth, deleteSubCategoryController)

module.exports = { subCategoryRouter }