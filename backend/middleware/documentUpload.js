const multer = require('multer');
const path = require('path');

// Memory storage - keeps file in buffer for direct S3 upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type ${ext}. Allowed: PDF, DOCX, TXT, IMG`), false);
    }
};

const documentUpload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = documentUpload;
