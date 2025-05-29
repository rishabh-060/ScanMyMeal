const { Router } = require('express')
const auth = require('../middlewares/auth')
const { getAllOrdersController, getAllUsersController, convertToAdminController, convertToUserController, suspendUserController, activateUserController, getAllProductsLengthController, manageUpcomingOrdersController } = require('../controllers/adminController')

const adminRouter = Router()


adminRouter.get('/upcoming-orders', auth, getAllOrdersController)
adminRouter.get('/get-all-users', auth, getAllUsersController)
adminRouter.post('/make-admin', auth, convertToAdminController)
adminRouter.post('/make-user', auth, convertToUserController)
adminRouter.post('/suspend-user', auth, suspendUserController)
adminRouter.post('/activate-user', auth, activateUserController)
adminRouter.post('/total-product', auth, getAllProductsLengthController)
adminRouter.post('/manage-order', auth, manageUpcomingOrdersController)


module.exports = adminRouter