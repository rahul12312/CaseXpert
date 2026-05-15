const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  getConversations, 
  startConversation, 
  getMessages, 
  sendMessage,
  markAsRead
} = require('../controllers/conversationController');

router.use(verifyToken);

router.get('/', getConversations);
router.post('/start', startConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/message', sendMessage);
router.put('/:conversationId/read', markAsRead);

module.exports = router;
