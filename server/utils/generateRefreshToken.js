const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const hashToken = require('./tokenHash')

const generatedRefreshToken = async (userId) => {
  const token = jwt.sign(
    { id: String(userId), type: 'refresh' },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn: '15d', issuer: 'scanmymeal' },
  )
  await userModel.updateOne({ _id: userId }, { $set: { refresh_token: hashToken(token) } })
  return token
}

module.exports = generatedRefreshToken
