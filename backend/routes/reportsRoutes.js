const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { verifyToken } = require('../middleware/auth');
const docUpload = require('../middleware/documentUpload');

// All reports require authentication
router.use(verifyToken);

// Dashboard Overview (Accessible to all roles, filtered by their constraints)
router.get('/dashboard-stats', reportsController.getDashboardStats);

// Case Reports
router.get('/cases', reportsController.getCaseReports);

// Hearing Reports
router.get('/hearings', reportsController.getHearingReports);

// Raw Case List for Table
router.get('/cases-list', reportsController.getRawCases);

// Advocate Performance (Admin sees all, Lawyer sees self)
// Restrict to admin and lawyer
router.get('/advocates', reportsController.getAdvocatePerformance);

// Case Intelligence Report
router.get('/intelligence/:id', reportsController.getCaseIntelligenceReport);
router.post('/intelligence/:id/generate', docUpload.array('documents'), reportsController.generateCaseIntelligenceReport);

// User Activity
router.get('/user-activity', reportsController.getUserActivity);

module.exports = router;
