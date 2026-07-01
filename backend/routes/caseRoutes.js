// ============================================================================
// Case Routes - API endpoints for case management
// ============================================================================

const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/caseUpload');

// All routes require authentication
router.use(authMiddleware.verifyToken);

/**
 * POST /api/case/create
 * Create a new case
 * Body: { title, description, case_number, case_type, lawyer_id, priority, court_name, filing_date, ... }
 */
router.post('/', caseController.createCase);
router.post('/create', caseController.createCase); // Keep for compatibility temporarily

/**
 * GET /api/case/
 * Get list of cases (alias for /list)
 */
router.get('/', caseController.getCaseList);

/**
 * GET /api/case/list
 * Get list of cases for the authenticated user/lawyer
 */
router.get('/list', caseController.getCaseList);

/**
 * GET /api/case/details/:id
 * Get detailed information about a specific case
 */
router.get('/details/:id', caseController.getCaseDetails);

/**
 * PUT /api/case/update/:id
 * Update case details
 * Body: { title, description, lawyer_id, priority, case_type, ... }
 */
router.put('/update/:id', caseController.updateCase);

/**
 * PUT /api/case/:id/assign
 * Assign an existing case to a lawyer
 * Body: { lawyer_id }
 */
router.put('/:id/assign', caseController.assignCase);

/**
 * PUT /api/case/status/:id
 * Update case status
 * Body: { status }
 */
router.put('/status/:id', caseController.updateStatus);
router.post('/update-status', caseController.updateStatusAndNotify); // Explicitly requested POST

/**
 * POST /api/case/add-update
 * Add a text update to a case
 * Body: { case_id, update_title, update_description, update_type }
 */
router.post('/add-update', caseController.addUpdate);

/**
 * POST /api/case/upload-document
 * Upload a document for a case
 * Body: FormData with { case_id, file }
 */
router.post('/upload-document', upload.single('file'), caseController.uploadDocument);

/**
 * DELETE /api/case/delete-document/:caseId/:documentId
 * Delete a document from a case
 */
router.delete('/delete-document/:caseId/:documentId', caseController.deleteDocument);

/**
 * PUT /api/case/rename-document/:caseId/:documentId
 * Rename a document
 */
router.put('/rename-document/:caseId/:documentId', caseController.renameDocument);

/**
 * POST /api/case/summarize-document
 * Summarize a document with AI
 */
router.post('/summarize-document', caseController.summarizeDocument);

/**
 * POST /api/case/add-timeline
 * Add a timeline event
 * Body: { case_id, event_title, event_description, event_type, event_date }
 */
router.post('/add-timeline', caseController.addTimelineEvent);

/**
 * GET /api/case/activities/:case_id
 * Get all activities for a case
 */
router.get('/activities/:case_id', caseController.getActivities);

/**
 * DELETE /api/case/delete/:id
 * Archive (soft delete) a case
 */
router.delete('/delete/:id', caseController.deleteCase);

/**
 * POST /api/case/add-hearing
 * Add a new hearing to a case
 */
router.post('/add-hearing', caseController.addHearing);

/**
 * PUT /api/case/update-hearing/:hearing_id
 * Update a hearing
 */
router.put('/update-hearing/:hearing_id', caseController.updateHearing);

/**
 * Case Tracking Robust Persistence Endpoints
 */
router.post('/seed', caseController.seedSampleCases);
router.delete('/clear-samples', caseController.clearSampleCases);
router.get('/all', caseController.getAllCases);
router.delete('/:id', caseController.deleteCasePermanently);

module.exports = router;

