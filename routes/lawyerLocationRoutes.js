// ============================================================================
// LAWYER LOCATION ROUTES
// ============================================================================

const express = require('express');
const router = express.Router();
const {
    updateLawyerLocation,
    getLawyersForMap,
    geocodeLawyerAddress,
    getNearbyLawyers
} = require('../controllers/lawyerLocationController');
const { verifyToken, isLawyer, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/map', getLawyersForMap);
router.get('/nearby', getNearbyLawyers);

// Protected routes - Lawyer only
router.post('/update', verifyToken, isLawyer, updateLawyerLocation);

// Admin routes
router.post('/geocode/:id', verifyToken, isAdmin, geocodeLawyerAddress);

module.exports = router;
