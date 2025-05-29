const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.accesstoken || req?.headers?.authorization?.split(" ")[1]
        
        if(!token){
            return res.status(401).json({
                message : "Token not found"
            })
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if(!decode){
            return res.status(401).json({
                message : 'Unauthorized access',
                error : true,
                success : false
            })
        }
        req.userId = decode.id
        
        next()
    } catch (error) {
        return res.status(500).json({
            message :  "Login required",// error.message || error,
            error : true,
            success : false
        })
    }
}

module.exports = auth 