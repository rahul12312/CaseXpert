// ============================================================================
// AI Legal Assistant Chat Routes
// RESTful API endpoints for chat functionality
// ============================================================================

const express = require("express");
const router = express.Router();
const {
    sendChatMessage,
    getChatSessions,
    getSessionMessages,
    createNewSession,
    deleteSession,
    uploadDocument
} = require("../controllers/aiChatController");

const { verifyToken } = require("../middleware/auth");

// ============================================
// All routes require authentication
// ============================================
router.use(verifyToken);

// ============================================
// CHAT MESSAGE ENDPOINTS
// ============================================

/**
 * POST /api/chat/send
 * Send a message and get AI response
 * Body: { sessionId?: number, message: string, task?: string }
 */
router.post("/send", sendChatMessage);

// ============================================
// SESSION MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /api/chat/sessions
 * Get all chat sessions for current user
 * Query params: ?limit=50&offset=0
 */
router.get("/sessions", getChatSessions);

/**
 * POST /api/chat/sessions/new
 * Create a new chat session
 * Body: { title?: string, sessionType?: string }
 */
router.post("/sessions/new", createNewSession);

/**
 * GET /api/chat/messages/:sessionId
 * Get all messages in a specific session
 */
router.get("/messages/:sessionId", getSessionMessages);

/**
 * DELETE /api/chat/sessions/:sessionId
 * Delete a chat session (soft delete)
 */
router.delete("/sessions/:sessionId", deleteSession);

/**
 * POST /api/chat/upload-document
 * Upload a document for chat context
 * Body: FormData { document, sessionId }
 */
const upload = require('../middleware/caseUpload');
router.post("/upload-document", upload.single('document'), uploadDocument);

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /api/chat/health
 * Check if chat service is working
 */
router.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "AI Legal Assistant Chat",
        status: "operational",
        features: [
            "Persistent chat sessions",
            "Message history",
            "OpenAI integration",
            "Multi-session support"
        ],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
