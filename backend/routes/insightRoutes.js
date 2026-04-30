const express = require('express');
const router = express.Router();
const { getAIInsights } = require('../controllers/insightsController');
const { verifyToken } = require('../middleware/auth');

// All insight routes require auth
router.use(verifyToken);

// Dashboard Insights
router.get('/dashboard', getAIInsights);

module.exports = router;
