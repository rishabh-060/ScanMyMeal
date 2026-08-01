const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.cookies.accesstoken || req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return res.status(401).json({ success: false, error: true, message: 'Login required', code: 'AUTH_REQUIRED' })
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN, {
      issuer: 'scanmymeal',
    })
    if (decoded.type !== 'access') throw new Error('Wrong token type')
    req.userId = decoded.id
    return next()
  } catch (_error) {
    return res.status(401).json({ success: false, error: true, message: 'Session expired', code: 'INVALID_ACCESS_TOKEN' })
  }
}

module.exports = auth
