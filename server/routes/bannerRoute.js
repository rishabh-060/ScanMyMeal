const { Router } = require('express')
const { getActiveBannersController } = require('../controllers/bannerController')

const bannerRouter = Router()
bannerRouter.get('/active', getActiveBannersController)

module.exports = bannerRouter
