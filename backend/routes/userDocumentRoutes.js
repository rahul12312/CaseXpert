const express = require('express');
const router = express.Router();
const controller = require('../controllers/userDocumentController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/documentUpload');

// Secure all routes
router.use(verifyToken);

/**
 * POST /api/user-documents/upload
 * Upload a new document (PDF, DOCX, etc.)
 * Body: FormData { file, title }
 */
router.post('/upload', upload.single('file'), controller.uploadDocument);

/**
 * POST /api/user-documents/save-draft
 * Save a text draft from AI assistant or manual entry
 * Body: { title, content }
 */
router.post('/save-draft', controller.saveDraft);

/**
 * GET /api/user-documents/list
 * List of user's documents
 * Query: ?type=draft|uploaded (optional)
 */
router.get('/list', controller.listDocuments);

/**
 * DELETE /api/user-documents/:id
 * Delete a document
 */
router.delete('/:id', controller.deleteDocument);

/**
 * GET /api/user-documents/:id/url
 * Get a presigned S3 download/view URL
 */
router.get('/:id/url', controller.getDocumentUrl);

module.exports = router;
