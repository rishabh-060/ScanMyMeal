const { Router } = require('express')
const auth = require('../middlewares/auth')
const { addAddressController, getAddressController, updateAddressController, removeAddressController } = require('../controllers/addressController')

const addressRouter = Router()

addressRouter.post('/add-address', auth, addAddressController)
addressRouter.get('/get-address', auth, getAddressController)
addressRouter.put('/update-address', auth, updateAddressController)
addressRouter.delete('/delete-address', auth, removeAddressController )

module.exports = { addressRouter }