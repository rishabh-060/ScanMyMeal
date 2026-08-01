const { v2: cloudinary } = require('cloudinary')
const AppError = require('./AppError')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_APIKEY,
  api_secret: process.env.CLOUDINARY_CLOUD_APISECRET,
})

const uploadImageCloudinary = async (image) => {
  if (!image?.buffer) throw new AppError('Media file is required', 400, 'FILE_REQUIRED')
  const resourceType = image.mimetype === 'video/mp4' ? 'video' : 'image'
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'scanmymeal', resource_type: resourceType, use_filename: false, unique_filename: true },
      (error, result) => error ? reject(new AppError('Media upload failed', 502, 'MEDIA_UPLOAD_FAILED')) : resolve(result),
    ).end(image.buffer)
  })
}

module.exports = uploadImageCloudinary
