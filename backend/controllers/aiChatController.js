// ============================================================================
// AI Legal Assistant Chat Controller
// Production-ready chat with OpenAI integration and database persistence
// ============================================================================

const { getDatabase } = require("../config/database");
const { askAiLegalAssistant } = require("../services/aiLegalAssistantGroq");

/**
 * POST /api/chat/send
 * Send a message and get AI response (Groq)
 * Saves both user message and AI response to database
 */
const sendChatMessage = async (req, res) => {
    const db = getDatabase();
    const startTime = Date.now();

    // Declare variables outside try block for error handling scope
    let currentSessionId = null;
    let userMessage = "";
    let task = "";

    try {
        console.log("\n📨 Chat message received (Groq)");
        // Extract body safely
        const body = req.body || {};
        userMessage = body.message || "";
        task = body.task || "";
        const language = body.language || "en";
        let inputSessionId = body.sessionId;

        const userId = req.user?.id; // From JWT middleware

        // Validation
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (!userMessage || typeof userMessage !== "string" || userMessage.trim().length === 0) {
            return res.json({
                success: true,
                aiResponse: "Please enter a valid legal question.",
                timestamp: new Date().toISOString()
            }); // Return 200 with polite message per requirements
        }

        if (userMessage.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Message too long. Maximum 5000 characters allowed."
            });
        }

        console.log(`   User ID: ${userId}`);
        console.log(`   Session ID: ${inputSessionId || "NEW"}`);
        console.log(`   Message: "${userMessage.substring(0, 100)}..."`);

        currentSessionId = inputSessionId;

        // If no sessionId provided, create a new session
        if (!currentSessionId) {
            const sessionType = task || "general_legal";
            // Generate title from first message
            const title = userMessage.length > 40 ? userMessage.substring(0, 40) + "..." : userMessage;

            const [result] = await db.execute(
                `INSERT INTO ai_chat_sessions (user_id, title, session_type) 
         VALUES (?, ?, ?)`,
                [userId, title, sessionType]
            );
            currentSessionId = result.insertId;
            console.log(`   ✅ Created new session: ${currentSessionId}`);
        } else {
            // Verify session belongs to user
            const [sessions] = await db.execute(
                "SELECT id FROM ai_chat_sessions WHERE id = ? AND user_id = ?",
                [currentSessionId, userId]
            );

            if (sessions.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Session not found or access denied"
                });
            }
        }

        // Get conversation history from database
        const [historyRows] = await db.execute(
            `SELECT role, message 
       FROM ai_chat_messages 
       WHERE session_id = ? AND is_deleted = FALSE 
       ORDER BY created_at ASC`,
            [currentSessionId]
        );

        // Save user message to database
        await db.execute(
            `INSERT INTO ai_chat_messages (session_id, role, message) 
       VALUES (?, 'user', ?)`,
            [currentSessionId, userMessage.trim()]
        );

        console.log(`   💾 User message saved to DB`);

        // Build messages array for AI
        const messages = [];

        // 1. History
        historyRows.forEach(row => {
            messages.push({
                role: row.role,
                content: row.message
            });
        });

        // 2. Current user message
        messages.push({
            role: "user",
            content: userMessage.trim()
        });

        console.log(`   📤 Sending ${messages.length} messages to Groq...`);

        // Call AI service (Groq)
        // Returns { reply: string, source: "groq" | "fallback" }
        const { reply, source } = await askAiLegalAssistant(messages, task, language);

        const processingTime = Date.now() - startTime;
        console.log(`   ✅ Response received (${processingTime}ms) - Source: ${source}`);

        // Save AI response to database
        await db.execute(
            `INSERT INTO ai_chat_messages 
       (session_id, role, message, model_used, processing_time_ms) 
       VALUES (?, 'assistant', ?, ?, ?)`,
            [currentSessionId, reply, `groq-${source}`, processingTime]
        );

        console.log(`   💾 AI response saved to DB`);

        // Get updated session info
        const [sessionInfo] = await db.execute(
            `SELECT id, title, created_at, last_activity_at 
       FROM ai_chat_sessions 
       WHERE id = ?`,
            [currentSessionId]
        );

        return res.json({
            success: true,
            sessionId: currentSessionId,
            session: sessionInfo[0],
            userMessage: userMessage.trim(),
            aiResponse: reply, // Frontend expects aiResponse key
            source: source,
            disclaimer: "⚖️ This is general legal information only, not legal advice (Powered by Groq LLaMA 3).",
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("   ❌ FATAL Error in sendChatMessage:");
        console.error("   Message:", err.message);
        console.error("   Stack:", err.stack);

        // Fallback message for any crash
        const fallbackMessage = "I encountered an internal system error. Please try again later. (Error: " + (err.message || "Unknown") + ")";

        // Return 200 with fallback - NEVER 500
        return res.json({
            success: true,
            sessionId: currentSessionId,
            userMessage: userMessage,
            aiResponse: fallbackMessage,
            source: "system_error",
            disclaimer: "⚠️ System encountered an error. Please contact support.",
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * GET /api/chat/sessions
 * Get all chat sessions for the current user
 */
const getChatSessions = async (req, res) => {
    // 1. Safe defaults for response
    const emptyResponse = {
        success: true,
        sessions: [],
        groupedSessions: {
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: []
        },
        total: 0
    };

    try {
        const db = getDatabase();
        if (!db) {
            console.warn("   ⚠️ DB not available in getChatSessions");
            return res.json(emptyResponse);
        }

        const userId = req.user?.id;

        if (!userId) {
            // If auth middleware passed but no user ID, standard 401
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        // 2. Strict Input Validation
        let limitVal = 50;
        let offsetVal = 0;

        if (req.query.limit) {
            const parsed = parseInt(req.query.limit);
            if (!isNaN(parsed) && parsed > 0) limitVal = parsed;
        }

        if (req.query.offset) {
            const parsed = parseInt(req.query.offset);
            if (!isNaN(parsed) && parsed >= 0) offsetVal = parsed;
        }

        console.log(`\n📂 Fetching chat sessions for user ${userId} (Lim: ${limitVal}, Off: ${offsetVal})`);

        // 3. Robust DB Query
        let sessions = [];
        try {
            // Using direct values for LIMIT/OFFSET in query string (safe because they are forced integers check above)
            // This avoids "Incorrect arguments" error that sometimes happens with prepared statements for LIMIT
            const [rows] = await db.execute(
                `SELECT 
                s.id,
                s.title,
                s.session_type,
                s.is_active,
                s.created_at,
                s.last_activity_at,
                COUNT(m.id) as message_count
               FROM ai_chat_sessions s
               LEFT JOIN ai_chat_messages m ON s.id = m.session_id AND m.is_deleted = FALSE
               WHERE s.user_id = ? AND s.is_active = TRUE
               GROUP BY s.id
               ORDER BY s.last_activity_at DESC
               LIMIT ${limitVal} OFFSET ${offsetVal}`,
                [userId]
            );
            sessions = rows || [];
        } catch (dbErr) {
            console.error("   ❌ Database error in getChatSessions:", dbErr.message);
            // Fallback to empty array - DO NOT CRASH
            return res.json(emptyResponse);
        }

        console.log(`   ✅ Found ${sessions.length} sessions`);

        // 4. Safe Grouping
        if (sessions.length === 0) {
            return res.json(emptyResponse);
        }

        let groupedSessions = emptyResponse.groupedSessions;
        try {
            groupedSessions = groupSessionsByDate(sessions);
        } catch (groupErr) {
            console.error("   ⚠️ Grouping error:", groupErr.message);
            // Ignore grouping error, just return sessions
        }

        return res.json({
            success: true,
            sessions: sessions,
            groupedSessions: groupedSessions,
            total: sessions.length
        });

    } catch (err) {
        console.error("   ❌ FATAL Error in getChatSessions:", err.message);
        console.error(err.stack);

        // 5. Ultimate Fallback - Never return 500
        return res.json(emptyResponse);
    }
};

/**
 * GET /api/chat/messages/:sessionId
 * Get all messages in a specific session
 */
const getSessionMessages = async (req, res) => {
    const db = getDatabase();

    try {
        const userId = req.user?.id;
        const { sessionId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        console.log(`\n💬 Fetching messages for session ${sessionId}`);

        // Verify session belongs to user
        const [sessions] = await db.execute(
            "SELECT * FROM ai_chat_sessions WHERE id = ? AND user_id = ?",
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Session not found or access denied"
            });
        }

        // Get all messages
        const [messages] = await db.execute(
            `SELECT 
        id,
        role,
        message,
        tokens_used,
        model_used,
        processing_time_ms,
        created_at
       FROM ai_chat_messages
       WHERE session_id = ? AND is_deleted = FALSE
       ORDER BY created_at ASC`,
            [sessionId]
        );

        console.log(`   ✅ Found ${messages.length} messages`);

        return res.json({
            success: true,
            session: sessions[0],
            messages: messages,
            total: messages.length
        });

    } catch (err) {
        console.error("   ❌ Error in getSessionMessages:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
};

/**
 * POST /api/chat/sessions/new
 * Create a new chat session
 */
const createNewSession = async (req, res) => {
    const db = getDatabase();

    try {
        const userId = req.user?.id;
        const { title = "New Chat", sessionType = "general_legal" } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        console.log(`\n➕ Creating new chat session for user ${userId}`);

        const [result] = await db.execute(
            `INSERT INTO ai_chat_sessions (user_id, title, session_type) 
       VALUES (?, ?, ?)`,
            [userId, title, sessionType]
        );

        const sessionId = result.insertId;

        const [newSession] = await db.execute(
            "SELECT * FROM ai_chat_sessions WHERE id = ?",
            [sessionId]
        );

        console.log(`   ✅ Created session ${sessionId}`);

        return res.json({
            success: true,
            session: newSession[0],
            message: "New chat session created"
        });

    } catch (err) {
        console.error("   ❌ Error in createNewSession:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to create new session",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
};

/**
 * DELETE /api/chat/sessions/:sessionId
 * Delete a chat session (soft delete)
 */
const deleteSession = async (req, res) => {
    const db = getDatabase();

    try {
        const userId = req.user?.id;
        const { sessionId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        console.log(`\n🗑️ Deleting session ${sessionId}`);

        // Verify ownership
        const [sessions] = await db.execute(
            "SELECT id FROM ai_chat_sessions WHERE id = ? AND user_id = ?",
            [sessionId, userId]
        );

        if (sessions.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Session not found or access denied"
            });
        }

        // Soft delete: mark session as inactive and messages as deleted
        await db.execute(
            "UPDATE ai_chat_sessions SET is_active = FALSE WHERE id = ?",
            [sessionId]
        );

        await db.execute(
            "UPDATE ai_chat_messages SET is_deleted = TRUE WHERE session_id = ?",
            [sessionId]
        );

        console.log(`   ✅ Session deleted`);

        return res.json({
            success: true,
            message: "Chat session deleted successfully"
        });

    } catch (err) {
        console.error("   ❌ Error in deleteSession:", err);

        return res.json({
            success: false,
            message: "Failed to delete session",
            error: err.message
        });
    }
};

/**
 * Helper: Group sessions by date
 */
const groupSessionsByDate = (sessions) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const grouped = {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: []
    };

    sessions.forEach(session => {
        // Safety check for invalid dates or nulls
        if (!session.last_activity_at) {
            grouped.older.push(session);
            return;
        }

        const sessionDate = new Date(session.last_activity_at);
        sessionDate.setHours(0, 0, 0, 0);

        if (isNaN(sessionDate.getTime())) {
            grouped.older.push(session);
            return;
        }

        if (sessionDate.getTime() === today.getTime()) {
            grouped.today.push(session);
        } else if (sessionDate.getTime() === yesterday.getTime()) {
            grouped.yesterday.push(session);
        } else if (sessionDate >= lastWeek) {
            grouped.lastWeek.push(session);
        } else if (sessionDate >= lastMonth) {
            grouped.lastMonth.push(session);
        } else {
            grouped.older.push(session);
        }
    });

    return grouped;
};

/**
 * POST /api/chat/upload-document
 * Upload a document context for the session
 */
const uploadDocument = async (req, res) => {
    const db = getDatabase();
    const fs = require('fs').promises;
    const path = require('path');
    const pdf = require('pdf-parse');

    try {
        const userId = req.user?.id;
        const file = req.file;
        let sessionId = req.body.sessionId;

        if (!userId) return res.status(401).json({ success: false, message: "Auth required" });
        if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

        console.log(`\n📎 Uploading document for user ${userId}, session ${sessionId || 'NEW'}`);

        // 1. Ensure Session Exists
        if (!sessionId || sessionId === 'null' || sessionId === 'undefined') {
            const [result] = await db.execute(
                `INSERT INTO ai_chat_sessions (user_id, title, session_type) VALUES (?, ?, ?)`,
                [userId, `Chat about ${file.originalname}`, 'document_analysis']
            );
            sessionId = result.insertId;
            console.log(`   ✅ Created new session for upload: ${sessionId}`);
        }

        // 2. Read File Content
        let fileContent = "";
        const fileExt = path.extname(file.originalname).toLowerCase();

        try {
            if (fileExt === '.pdf') {
                const dataBuffer = await fs.readFile(file.path);
                const pdfData = await pdf(dataBuffer);
                fileContent = pdfData.text;
                // Basic cleanup of PDF text
                fileContent = fileContent.replace(/\n\s*\n/g, '\n').trim();
            } else if (['.txt', '.md', '.json', '.js', '.csv', '.html'].includes(fileExt)) {
                fileContent = await fs.readFile(file.path, 'utf8');
            } else {
                // Placeholder for binary/unsupported files
                fileContent = `[Attachment: ${file.originalname}] (Content extraction not supported for this file type. Context based on filename only.)`;
            }
        } catch (readErr) {
            console.error("   ❌ Error reading file content:", readErr);
            fileContent = `[Error reading file content: ${readErr.message}]`;
        }

        // 3. Save as a Context Message
        // Limit context size to avoid token overflow (approx 15k chars is safe for typical 32k/128k context windows)
        const contextMessage = `[SYSTEM: User uploaded a document context]\nFilename: ${file.originalname}\nContent:\n${fileContent.substring(0, 15000)}`;

        await db.execute(
            `INSERT INTO ai_chat_messages (session_id, role, message) VALUES (?, 'system', ?)`,
            [sessionId, contextMessage]
        );

        console.log(`   💾 Document context saved to session ${sessionId} (${fileContent.length} chars)`);

        res.json({
            success: true,
            message: "Document uploaded and context added",
            sessionId: sessionId,
            filename: file.originalname,
            extractedLength: fileContent.length
        });

    } catch (err) {
        console.error("   ❌ Upload error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    sendChatMessage,
    getChatSessions,
    getSessionMessages,
    createNewSession,
    deleteSession,
    uploadDocument
};
