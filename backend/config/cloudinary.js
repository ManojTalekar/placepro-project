const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for resume PDFs
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'placepro/resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    public_id: (req, file) => `resume_${req.user.id}_${Date.now()}`
  }
});

// Local storage fallback (if cloudinary not configured)
const localStorage = multer.memoryStorage();

const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
};

const uploadResume = multer({
  storage: isCloudinaryConfigured() ? resumeStorage : localStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

module.exports = { cloudinary, uploadResume, isCloudinaryConfigured };
