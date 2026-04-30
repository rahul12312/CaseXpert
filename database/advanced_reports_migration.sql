-- ============================================================================
-- CaseXpert - Advanced Reports Migration
-- ============================================================================
-- This script adds supporting tables for the Advanced Reports module
-- Run this against the existing `casexpert_db` database
-- ============================================================================

USE casexpert_db;

-- ============================================================================
-- 1. CASE ACTIVITIES (safety: create if missing)
--    Audit log for all case-related actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    activity TEXT NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    actor_role ENUM('user', 'lawyer', 'admin', 'system') NOT NULL DEFAULT 'user',
    activity_type ENUM('create', 'update', 'status-change', 'document-upload', 'timeline-add', 'comment', 'delete', 'other') NOT NULL DEFAULT 'other',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_case_id (case_id),
    INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- 2. LAWYER STATS
--    Aggregate metrics for lawyer performance reporting
-- ============================================================================

CREATE TABLE IF NOT EXISTS lawyer_stats (
    lawyer_id BIGINT UNSIGNED NOT NULL,
    total_cases INT UNSIGNED DEFAULT 0,
    active_cases INT UNSIGNED DEFAULT 0,
    closed_cases INT UNSIGNED DEFAULT 0,
    avg_resolution_time DECIMAL(10,2) NULL COMMENT 'Average resolution time in days',
    rating DECIMAL(3,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (lawyer_id),
    CONSTRAINT fk_lawyer_stats_lawyer_id
        FOREIGN KEY (lawyer_id)
        REFERENCES lawyers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================================
-- 3. USER ACTIVITY LOGS
--    Per-user activity stream for reporting and audit
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_activity_logs_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_user_activity_user (user_id),
    INDEX idx_user_activity_type (activity_type),
    INDEX idx_user_activity_timestamp (timestamp)
);

-- ============================================================================
-- 4. CASE METRICS
--    Pre-aggregated counters per case for workload analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_metrics (
    case_id BIGINT UNSIGNED NOT NULL,
    total_updates INT UNSIGNED DEFAULT 0,
    total_documents INT UNSIGNED DEFAULT 0,
    total_timeline_events INT UNSIGNED DEFAULT 0,
    last_update_time TIMESTAMP NULL,

    PRIMARY KEY (case_id),
    CONSTRAINT fk_case_metrics_case_id
        FOREIGN KEY (case_id)
        REFERENCES cases(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_case_metrics_last_update (last_update_time)
);
