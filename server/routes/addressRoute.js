const { Router } = require('express')
const auth = require('../middlewares/auth')
const customerOnly = require('../middlewares/customerOnly')
const { addAddressController, getAddressController, updateAddressController, removeAddressController } = require('../controllers/addressController')

const addressRouter = Router()

addressRouter.use(auth, customerOnly)
addressRouter.post('/add-address', addAddressController)
addressRouter.get('/get-address', getAddressController)
addressRouter.put('/update-address', updateAddressController)
addressRouter.delete('/delete-address', removeAddressController )

module.exports = { addressRouter }
