// ============================================================================
// LAWYER MARKETPLACE ROUTES
// API routes for lawyer search, filter, and marketplace
// ============================================================================

const express = require("express");
const router = express.Router();
const {
    getAllLawyers,
    getLawyerById,
    getFilterOptions,
    searchLawyers,
    createLawyer,
    addReview
} = require("../controllers/lawyerMarketplaceController");
const { getAIRecommendation } = require("../controllers/lawyerRecommendationController");

const { verifyToken, isAdmin } = require("../middleware/auth");

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * @route   GET /api/lawyers
 * @desc    Get all lawyers with advanced filters
 * @access  Public
 * @query   search, name, city, practice_area, experience_min, experience_max,
 *          fee_min, fee_max, language, rating, verified_only, gender,
 *          availability, sort_by, sort_order, limit, offset
 */
router.get("/", getAllLawyers);

/**
 * @route   GET /api/lawyers/filters
 * @desc    Get available filter options
 * @access  Public
 */
router.get("/filters", getFilterOptions);

/**
 * @route   GET /api/lawyers/search
 * @desc    Search lawyers by keyword
 * @access  Public
 * @query   q (search query), limit
 */
router.get("/search", searchLawyers);

/**
 * @route   POST /api/lawyers/ai-recommend
 * @desc    Get AI-powered lawyer recommendations
 * @access  Public
 */
router.post("/ai-recommend", getAIRecommendation);

/**
 * @route   GET /api/lawyers/:id
 * @desc    Get lawyer by ID with full details
 * @access  Public
 */
router.get("/:id", getLawyerById);

/**
 * @route   POST /api/lawyers/:id/reviews
 * @desc    Add a review for a lawyer
 * @access  Private (User logged in)
 */
router.post("/:id/reviews", verifyToken, addReview);

// ============================================================================
// PROTECTED ROUTES (Admin only)
// ============================================================================

/**
 * @route   POST /api/lawyers/create
 * @desc    Create new lawyer profile
 * @access  Private (Admin only)
 */
router.post("/create", verifyToken, isAdmin, createLawyer);

module.exports = router;
