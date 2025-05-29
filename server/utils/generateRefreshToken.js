const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")


const generatedRefreshToken = async (userId) => {
    const token = await jwt.sign(
        { id : userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn : '30d' }
    )
    const updateRefreshToken = await userModel.updateOne(
        { id : userId },
        { refresh_token : token }
    )
    
    return token
}


module.exports = generatedRefreshToken