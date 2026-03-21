-- ============================================
-- AI Legal Assistant Chat Schema
-- Persistent chat sessions with message history
-- ============================================

USE casexpert_db;

-- ============================================
-- AI CHAT SESSIONS TABLE
-- Stores individual chat conversations
-- ============================================
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(500) NOT NULL COMMENT 'Auto-generated from first message',
    session_type ENUM('general_legal', 'case_analysis', 'document_review', 'legal_research') DEFAULT 'general_legal',
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active),
    INDEX idx_last_activity (last_activity_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AI CHAT MESSAGES TABLE
-- Stores individual messages in each session
-- ============================================
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    message TEXT NOT NULL,
    tokens_used INT UNSIGNED DEFAULT 0 COMMENT 'Track API token usage',
    model_used VARCHAR(50) DEFAULT 'gpt-4o-mini',
    processing_time_ms INT UNSIGNED COMMENT 'Response time in milliseconds',
    is_deleted BOOLEAN DEFAULT FALSE,
    metadata JSON COMMENT 'Additional message metadata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_message (message)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUTO-GENERATE CHAT TITLE FROM FIRST MESSAGE
-- ============================================
DELIMITER //
CREATE TRIGGER IF NOT EXISTS ai_chat_title_generator
AFTER INSERT ON ai_chat_messages
FOR EACH ROW
BEGIN
    DECLARE msg_count INT;
    DECLARE session_title VARCHAR(500);
    
    -- Count messages in this session
    SELECT COUNT(*) INTO msg_count 
    FROM ai_chat_messages 
    WHERE session_id = NEW.session_id;
    
    -- If this is the first user message, use it as title
    IF msg_count = 1 AND NEW.role = 'user' THEN
        -- Truncate message to 100 chars for title
        SET session_title = LEFT(NEW.message, 100);
        
        UPDATE ai_chat_sessions 
        SET title = session_title,
            last_activity_at = NOW()
        WHERE id = NEW.session_id;
    ELSE
        -- Update last_activity_at for existing sessions
        UPDATE ai_chat_sessions 
        SET last_activity_at = NOW()
        WHERE id = NEW.session_id;
    END IF;
END//
DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite index for fetching user's recent chats
CREATE INDEX idx_user_last_activity ON ai_chat_sessions(user_id, last_activity_at DESC);

-- Index for message ordering within session
CREATE INDEX idx_session_created ON ai_chat_messages(session_id, created_at ASC);

-- ============================================
-- VIEW: Recent Chat Sessions with Message Preview
-- ============================================
CREATE OR REPLACE VIEW ai_chat_sessions_preview AS
SELECT 
    s.id,
    s.user_id,
    s.title,
    s.session_type,
    s.is_active,
    s.created_at,
    s.last_activity_at,
    COUNT(m.id) as message_count,
    (SELECT message FROM ai_chat_messages 
     WHERE session_id = s.id 
     AND role = 'user' 
     ORDER BY created_at DESC LIMIT 1) as last_user_message,
    (SELECT created_at FROM ai_chat_messages 
     WHERE session_id = s.id 
     ORDER BY created_at DESC LIMIT 1) as last_message_at
FROM ai_chat_sessions s
LEFT JOIN ai_chat_messages m ON s.id = m.session_id AND m.is_deleted = FALSE
GROUP BY s.id
ORDER BY s.last_activity_at DESC;

-- ============================================
-- STORED PROCEDURE: Get Chat History
-- ============================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_user_chat_sessions(
    IN p_user_id BIGINT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        id,
        title,
        session_type,
        is_active,
        created_at,
        last_activity_at,
        (SELECT COUNT(*) FROM ai_chat_messages WHERE session_id = ai_chat_sessions.id AND is_deleted = FALSE) as message_count
    FROM ai_chat_sessions
    WHERE user_id = p_user_id
    ORDER BY last_activity_at DESC
    LIMIT p_limit OFFSET p_offset;
END//
DELIMITER ;

-- ============================================
-- STORED PROCEDURE: Get Messages in Session
-- ============================================
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_session_messages(
    IN p_session_id BIGINT
)
BEGIN
    SELECT 
        id,
        session_id,
        role,
        message,
        tokens_used,
        model_used,
        processing_time_ms,
        created_at
    FROM ai_chat_messages
    WHERE session_id = p_session_id
    AND is_deleted = FALSE
    ORDER BY created_at ASC;
END//
DELIMITER ;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- You can insert sample chat sessions here if needed for testing

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 1. User authentication required before accessing chats
-- 2. Foreign key ensures chat ownership
-- 3. Soft delete for message recovery
-- 4. Token tracking for cost management
-- 5. Indexes for fast retrieval
-- 6. Triggers for auto-updates
-- ============================================
