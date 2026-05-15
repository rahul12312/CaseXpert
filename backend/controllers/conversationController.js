const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { getIO } = require('../services/socketService');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email user_type profile_image')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Start or get existing conversation
exports.startConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({ success: false, message: 'Participant ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    }).populate('participants', 'name email user_type profile_image');

    if (!conversation) {
      console.log('Creating new conversation between:', userId, 'and', participantId);
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId],
        unreadCounts: {
          [userId]: 0,
          [participantId]: 0
        }
      });
      await conversation.save();
      conversation = await Conversation.findById(conversation._id).populate('participants', 'name email user_type profile_image');
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('Error starting conversation:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profile_image');

    // Reset unread count for current user
    if (conversation.unreadCounts && conversation.unreadCounts.get(userId) > 0) {
      conversation.unreadCounts.set(userId, 0);
      await conversation.save();
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const message = new Message({
      conversationId,
      sender: senderId,
      content
    });

    await message.save();

    // Populate sender info for real-time update
    await message.populate('sender', 'name profile_image');

    // Update conversation last message and unread counts
    conversation.lastMessage = message._id;
    
    // Increment unread count for other participants
    conversation.participants.forEach(pId => {
      const pIdStr = pId.toString();
      if (pIdStr !== senderId) {
        const currentCount = conversation.unreadCounts.get(pIdStr) || 0;
        conversation.unreadCounts.set(pIdStr, currentCount + 1);
      }
    });

    await conversation.save();

    // Emit socket event to the conversation room
    try {
      const io = getIO();
      io.to(`chat_${conversationId}`).emit('new-message', { message, conversationId });
      
      // Also emit to users directly for sidebar updates
      conversation.participants.forEach(pId => {
        io.to(`user_${pId.toString()}`).emit('conversation-updated', { 
          conversationId, 
          lastMessage: message,
          unreadCount: conversation.unreadCounts.get(pId.toString())
        });
      });
    } catch (ioError) {
      console.warn('Socket emit failed (socket may not be initialized):', ioError.message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.unreadCounts && conversation.unreadCounts.get(userId) > 0) {
      conversation.unreadCounts.set(userId, 0);
      await conversation.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
