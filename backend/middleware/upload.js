const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Ensure environment variables are loaded from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
console.log("☁️ CLOUDINARY CONFIG CHECK:", {
  name: process.env.CLOUDINARY_CLOUD_NAME ? "PRESENT" : "MISSING",
  key: process.env.CLOUDINARY_API_KEY ? "PRESENT" : "MISSING",
  secret: process.env.CLOUDINARY_API_SECRET ? "PRESENT" : "MISSING"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'casexpert_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
