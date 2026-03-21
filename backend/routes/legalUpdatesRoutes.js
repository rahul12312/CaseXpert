const express = require('express');
const router = express.Router();
const legalUpdatesController = require('../controllers/legalUpdatesController');
// const auth = require('../middleware/auth'); // Uncomment if we want to protect these routes

// Public routes for now, as knowledge hub is generally accessible
router.get('/news', legalUpdatesController.getLegalNews);
router.get('/videos', legalUpdatesController.getLegalVideos);
router.post('/news', legalUpdatesController.addLegalNews); // Should be admin protected later

module.exports = router;
