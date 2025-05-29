const generateOtp = async (req, res) => {
    const value = await Math.floor(Math.random() * 900000) + 100000
    return value
}

module.exports = generateOtp