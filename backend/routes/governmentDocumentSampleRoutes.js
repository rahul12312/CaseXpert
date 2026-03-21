// ============================================================================
// Government Document Sample Routes
// API endpoints for official government document samples
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const governmentDocumentSampleController = require('../controllers/governmentDocumentSampleController');

// All routes require authentication
router.use(authMiddleware.verifyToken);

/**
 * GET /api/document-samples
 * Get all government document samples
 * Query params: ?category=RTI_Application&language=English&documentType=rti_format
 */
router.get('/', governmentDocumentSampleController.getAllSamples);

/**
 * GET /api/document-samples/categories
 * Get all available document categories
 */
router.get('/categories', governmentDocumentSampleController.getCategories);

/**
 * GET /api/document-samples/:documentType
 * Get a specific government document sample by type
 * Params: documentType (e.g., 'affidavit', 'rti_application')
 */
router.get('/:documentType', governmentDocumentSampleController.getSampleByType);

/**
 * GET /api/document-samples/:id/download
 * Track download of a government document sample
 */
router.get('/:id/download', governmentDocumentSampleController.trackDownload);

module.exports = router;
