const { v2 } = require('cloudinary');
require('dotenv').config()

const uploadImageCloudinary = async (image) => {
    v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_CLOUD_APIKEY, 
        api_secret: process.env.CLOUDINARY_CLOUD_APISECRET
    })
    
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer())

    const uploadImage = await new Promise((res, rej) => {
        v2.uploader.upload_stream({ folder : "Scan My Meal" }, ( error, uploadResult ) => {
            return res(uploadResult)
        }).end(buffer)
    })

    return uploadImage
}


module.exports = uploadImageCloudinary