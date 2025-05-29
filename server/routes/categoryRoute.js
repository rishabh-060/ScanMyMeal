const { Router } = require('express')
const auth = require('../middlewares/auth')
const { addCategoryController, getCategoryController, updateCategoryController, deleteCategoryController } = require('../controllers/categoryController')

const categoryRouter = Router()


categoryRouter.post('/add-category', auth, addCategoryController)
categoryRouter.get('/get-category', getCategoryController)
categoryRouter.put('/update-category', auth, updateCategoryController)
categoryRouter.delete('/delete-category', auth, deleteCategoryController)


module.exports = categoryRouter