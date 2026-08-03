const userModel = require('../models/userModel')

const customerOnly = async (req, res, next) => {
  try {
    const customer = await userModel.exists({ _id: req.userId, role: 'USER', status: 'Active' })
    if (!customer) {
      return res.status(403).json({ success: false, error: true, message: 'This action is available to customer accounts only', code: 'CUSTOMER_ACCOUNT_REQUIRED' })
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = customerOnly
