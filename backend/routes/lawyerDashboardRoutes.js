const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getClientQueries,
    getCaseRequests,
    acceptCaseRequest,
    declineCaseRequest,
    getLawyerProfile
} = require("../controllers/lawyerDashboardController");
const { verifyToken, requireRole } = require("../middleware/auth");

// All routes require authentication + lawyer role
router.use(verifyToken);
router.use(requireRole("lawyer"));

// Lawyer Dashboard Routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/client-queries", getClientQueries);
router.get("/case-requests", getCaseRequests);
router.post("/case-requests/:caseId/accept", acceptCaseRequest);
router.post("/case-requests/:caseId/decline", declineCaseRequest);
router.get("/profile", getLawyerProfile);

module.exports = router;
