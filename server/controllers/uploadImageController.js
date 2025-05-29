const uploadImageCloudinary = require("../utils/uploadImageCloudinary")

// Upload Image Controller
const uploadImageController = async (req, res) => {
    try {
        const file = req.file
        const uploadImage = await uploadImageCloudinary(file)

        if(!uploadImage) {
            return res.status(500).json({
                message : "Bad network connection | Try again",
                success : false,
                error : true
            })
        }

        return res.status(200).json({
            message : "Upload successfully",
            success : true,
            error : false,
            data : uploadImage
        })
    } catch (error) {
        return res.status(500).json({
            message : error?.message || error,
            error : true,
            success : false
        })
    }
}

module.exports = { uploadImageController }