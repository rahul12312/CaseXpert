-- ============================================================================
-- CaseXpert - Case Tracking System Database Schema
-- ============================================================================
-- This script creates all tables required for the case tracking system
-- Run this in MySQL Workbench on the casexpert_db database
-- ============================================================================

USE casexpert_db;

-- ============================================================================
-- 1. CASES TABLE
-- ============================================================================
-- Main table for storing legal cases
CREATE TABLE IF NOT EXISTS cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lawyer_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    case_type ENUM('civil', 'criminal', 'property', 'family', 'corporate', 'labor', 'tax', 'other') NOT NULL DEFAULT 'other',
    status ENUM('open', 'in-progress', 'hearing-scheduled', 'evidence-pending', 'under-review', 'closed', 'archived') NOT NULL DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL,
    
    -- Indexes for better query performance
    INDEX idx_user_id (user_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_status (status),
    INDEX idx_case_number (case_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. CASE UPDATES TABLE
-- ============================================================================
-- Stores text updates and notes for cases
CREATE TABLE IF NOT EXISTS case_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    update_title VARCHAR(255) NOT NULL,
    update_description TEXT,
    update_type ENUM('status-change', 'document-upload', 'hearing-update', 'general-update', 'evidence-update', 'lawyer-note') NOT NULL DEFAULT 'general-update',
    created_by VARCHAR(100) NOT NULL, -- user/lawyer/admin name
    created_by_role ENUM('user', 'lawyer', 'admin', 'system') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_case_id (case_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. CASE DOCUMENTS TABLE
-- ============================================================================
-- Stores uploaded documents for cases
CREATE TABLE IF NOT EXISTS case_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), -- pdf, jpg, png, doc, etc.
    file_size INT, -- in bytes
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_by_role ENUM('user', 'lawyer', 'admin') NOT NULL DEFAULT 'user',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_case_id (case_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. CASE TIMELINE TABLE
-- ============================================================================
-- Stores timeline events for cases (hearings, submissions, milestones)
CREATE TABLE IF NOT EXISTS case_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_type ENUM('case-created', 'status-change', 'hearing', 'submission', 'document-upload', 'evidence', 'judgment', 'other') NOT NULL DEFAULT 'other',
    event_date DATE NOT NULL, -- The actual date of the event
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_case_id (case_id),
    INDEX idx_event_date (event_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. CASE ACTIVITIES TABLE
-- ============================================================================
-- Stores all activities/actions performed on cases (audit log)
CREATE TABLE IF NOT EXISTS case_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    activity TEXT NOT NULL, -- Description of the activity
    actor_name VARCHAR(100) NOT NULL, -- Who performed the action
    actor_role ENUM('user', 'lawyer', 'admin', 'system') NOT NULL DEFAULT 'user',
    activity_type ENUM('create', 'update', 'status-change', 'document-upload', 'timeline-add', 'comment', 'delete', 'other') NOT NULL DEFAULT 'other',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_case_id (case_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample case (assuming user_id=1 and lawyer_id=1 exist)
-- INSERT INTO cases (user_id, lawyer_id, title, description, case_number, case_type, status, priority)
-- VALUES 
-- (1, 1, 'Property Dispute Case', 'Dispute regarding property ownership in Mumbai', 'CASE-2025-001', 'property', 'open', 'high');

-- ============================================================================
-- VIEWS (Optional - for easier querying)
-- ============================================================================

-- View for case details with user and lawyer names
CREATE OR REPLACE VIEW case_details_view AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.case_number,
    c.case_type,
    c.status,
    c.priority,
    c.is_archived,
    c.created_at,
    c.updated_at,
    u.name AS user_name,
    u.email AS user_email,
    l.name AS lawyer_name,
    l.email AS lawyer_email,
    l.specialization AS lawyer_specialization,
    (SELECT COUNT(*) FROM case_documents WHERE case_id = c.id) AS document_count,
    (SELECT COUNT(*) FROM case_updates WHERE case_id = c.id) AS update_count,
    (SELECT COUNT(*) FROM case_timeline WHERE case_id = c.id) AS timeline_count
FROM cases c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN lawyers l ON c.lawyer_id = l.id;

-- ============================================================================
-- STORED PROCEDURES (Optional - for complex operations)
-- ============================================================================

DELIMITER //

-- Procedure to create a new case with initial timeline and activity
CREATE PROCEDURE IF NOT EXISTS create_case_with_logs(
    IN p_user_id INT,
    IN p_lawyer_id INT,
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_case_number VARCHAR(100),
    IN p_case_type VARCHAR(50),
    IN p_priority VARCHAR(50),
    IN p_user_name VARCHAR(100)
)
BEGIN
    DECLARE new_case_id INT;
    
    -- Insert case
    INSERT INTO cases (user_id, lawyer_id, title, description, case_number, case_type, priority)
    VALUES (p_user_id, p_lawyer_id, p_title, p_description, p_case_number, p_case_type, p_priority);
    
    SET new_case_id = LAST_INSERT_ID();
    
    -- Add initial timeline entry
    INSERT INTO case_timeline (case_id, event_title, event_description, event_type, event_date)
    VALUES (new_case_id, 'Case Created', CONCAT('Case "', p_title, '" was created'), 'case-created', CURDATE());
    
    -- Add initial activity log
    INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
    VALUES (new_case_id, CONCAT('Case created: ', p_title), p_user_name, 'user', 'create');
    
    -- Return the new case ID
    SELECT new_case_id AS case_id;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS (Optional - for automatic logging)
-- ============================================================================

DELIMITER //

-- Trigger to log status changes
CREATE TRIGGER IF NOT EXISTS after_case_status_update
AFTER UPDATE ON cases
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        -- Add timeline entry for status change
        INSERT INTO case_timeline (case_id, event_title, event_description, event_type, event_date)
        VALUES (NEW.id, 'Status Changed', CONCAT('Status changed from "', OLD.status, '" to "', NEW.status, '"'), 'status-change', CURDATE());
        
        -- Add activity log for status change
        INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
        VALUES (NEW.id, CONCAT('Status changed to: ', NEW.status), 'System', 'system', 'status-change');
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_cases_user_status ON cases(user_id, status);
CREATE INDEX idx_cases_lawyer_status ON cases(lawyer_id, status);
CREATE INDEX idx_case_updates_case_created ON case_updates(case_id, created_at DESC);
CREATE INDEX idx_case_activities_case_timestamp ON case_activities(case_id, timestamp DESC);

-- ============================================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON casexpert_db.cases TO 'your_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON casexpert_db.case_updates TO 'your_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON casexpert_db.case_documents TO 'your_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON casexpert_db.case_timeline TO 'your_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON casexpert_db.case_activities TO 'your_user'@'localhost';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if all tables were created
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'casexpert_db' 
AND TABLE_NAME LIKE 'case%'
ORDER BY TABLE_NAME;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
