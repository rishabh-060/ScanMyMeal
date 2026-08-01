const jwt = require('jsonwebtoken')

const generatedAccessToken = (userId) => jwt.sign(
  { id: String(userId), type: 'access' },
  process.env.SECRET_KEY_ACCESS_TOKEN,
  { expiresIn: '15m', issuer: 'scanmymeal' },
)

module.exports = generatedAccessToken
