// ============================================================================
// Document Drafting Routes - PDF Generation
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// All routes require authentication
router.use(authMiddleware.verifyToken);

/**
 * POST /api/documents/generate
 * Generate a legal document (PDF)
 * Body: { documentType, details, userInputs }
 */
router.post('/generate', documentController.generateDocument);

/**
 * POST /api/documents/draft
 * Generate a text draft of a legal document (for AI assistant)
 * Body: { documentType, userInputs }
 */
router.post('/draft', documentController.generateDraft);

/**
 * GET /api/documents/samples
 * Get all available sample documents
 */
router.get('/samples', documentController.getDocumentSamples);

/**
 * GET /api/documents/samples/:type
 * Get metadata/URL for a specific document sample
 */
router.get('/samples/:type', documentController.getSample);

/**
 * GET /api/documents/samples/:type/view
 * View/Stream the sample PDF directly (on-the-fly generation)
 */
router.get('/samples/:type/view', documentController.viewSamplePdf);

/**
 * GET /api/documents/types
 * Get list of available document types
 */
router.get('/types', documentController.getDocumentTypes);

module.exports = router;
