const { randomInt } = require('crypto')

const generateOtp = () => String(randomInt(100000, 1000000))

module.exports = generateOtp
