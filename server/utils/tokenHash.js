const { createHash } = require('crypto')

const hashToken = (value) => createHash('sha256').update(String(value)).digest('hex')

module.exports = hashToken
