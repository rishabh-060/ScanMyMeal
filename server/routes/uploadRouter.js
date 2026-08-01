const { Router } = require('express')
const auth = require('../middlewares/auth')
const { uploadImageController } = require('../controllers/uploadImageController')
const upload = require('../middlewares/multer')
const admin = require('../middlewares/Admin')
const { requireAnyPermission } = require('../middlewares/Admin')
const { PERMISSIONS } = require('../constants/permissions')

const uploadRouter = Router()


uploadRouter.post('/upload', auth, admin, requireAnyPermission(PERMISSIONS.PRODUCTS_MANAGE, PERMISSIONS.BANNERS_MANAGE), upload.single('image'), uploadImageController)

module.exports = uploadRouter
