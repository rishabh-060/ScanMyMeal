const jwt = require('jsonwebtoken')

const generatedAccessToken = (userId) => jwt.sign(
  { id: String(userId), type: 'access' },
  process.env.SECRET_KEY_ACCESS_TOKEN,
  { expiresIn: '24h', issuer: 'scanmymeal' },
)

module.exports = generatedAccessToken
