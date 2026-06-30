const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route POST /api/video/token
 * @desc Get Twilio Video Access Token
 * @access Private
 */
router.post('/token', verifyToken, videoController.getToken);
router.get('/test-config', require('../controllers/debugController').checkTwilioConfig);

module.exports = router;
