const multer = require('multer')

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, WebP, GIF, and MP4 files are supported'))
    }
    return callback(null, true)
  },
})

module.exports = upload
