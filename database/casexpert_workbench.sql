-- ============================================
-- CaseXpert Database Schema
-- MySQL Workbench Compatible
-- Production-Ready Database for Legal Platform
-- ============================================
-- Version: 1.0
-- Date: 2024-11-28
-- Engine: InnoDB
-- Charset: UTF8MB4
-- ============================================

-- Drop database if exists (use with caution in production)
DROP DATABASE IF EXISTS casexpert_db;

-- Create database
CREATE DATABASE casexpert_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE casexpert_db;

-- ============================================
-- TABLE 1: USERS
-- Core user accounts table
-- ============================================
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt)',
    user_type ENUM('client', 'lawyer', 'admin') NOT NULL DEFAULT 'client',
    profile_image VARCHAR(500) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_phone (phone),
    INDEX idx_user_type (user_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts - clients, lawyers, and admins';

-- ============================================
-- TABLE 2: LAWYERS
-- Extended profile for lawyer users
-- ============================================
DROP TABLE IF EXISTS lawyers;

CREATE TABLE lawyers (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    specialization VARCHAR(255) NOT NULL COMMENT 'Primary area of practice',
    experience INT UNSIGNED DEFAULT 0 COMMENT 'Years of experience',
    languages VARCHAR(500) NULL COMMENT 'Comma-separated languages',
    rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating 0-5',
    fee_per_hour DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Consultation fee per hour',
    bio TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    total_cases INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_specialization (specialization),
    INDEX idx_rating (rating),
    INDEX idx_city (city),
    INDEX idx_availability (availability_status),
    
    CONSTRAINT fk_lawyers_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lawyer profiles and professional details';

-- ============================================
-- TABLE 3: CASES
-- Legal cases management
-- ============================================
DROP TABLE IF EXISTS cases;

CREATE TABLE cases (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    case_number VARCHAR(50) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Client ID',
    lawyer_id BIGINT UNSIGNED NULL COMMENT 'Assigned lawyer',
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) NULL COMMENT 'Criminal, Civil, Family, etc.',
    status ENUM('pending', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    next_hearing_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_case_number (case_number),
    INDEX idx_user_id (user_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_status (status),
    INDEX idx_case_type (case_type),
    INDEX idx_created_at (created_at),
    
    CONSTRAINT fk_cases_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_cases_lawyer_id 
        FOREIGN KEY (lawyer_id) 
        REFERENCES lawyers(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Legal cases and case management';

-- ============================================
-- TABLE 4: DOCUMENTS
-- Case documents and files
-- ============================================
DROP TABLE IF EXISTS documents;

CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    case_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED NOT NULL COMMENT 'User ID who uploaded',
    file_name VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT UNSIGNED NULL COMMENT 'Size in bytes',
    file_type VARCHAR(100) NULL COMMENT 'MIME type',
    document_type ENUM('evidence', 'contract', 'affidavit', 'petition', 'other') DEFAULT 'other',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_case_id (case_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_at (uploaded_at),
    
    CONSTRAINT fk_documents_case_id 
        FOREIGN KEY (case_id) 
        REFERENCES cases(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_documents_uploaded_by 
        FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Case documents and file management';

-- ============================================
-- TABLE 5: CHAT
-- Messages and communication
-- ============================================
DROP TABLE IF EXISTS chat;

CREATE TABLE chat (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    case_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'file', 'image', 'system') DEFAULT 'text',
    attachment_url VARCHAR(1000) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_case_id (case_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    
    CONSTRAINT fk_chat_case_id 
        FOREIGN KEY (case_id) 
        REFERENCES cases(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_chat_sender_id 
        FOREIGN KEY (sender_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_chat_receiver_id 
        FOREIGN KEY (receiver_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Chat messages and communication';

-- ============================================
-- TABLE 6: BOOKINGS
-- Consultation bookings and appointments
-- ============================================
DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    booking_number VARCHAR(50) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Client ID',
    lawyer_id BIGINT UNSIGNED NOT NULL,
    case_id BIGINT UNSIGNED NULL COMMENT 'Optional link to case',
    booking_time DATETIME NOT NULL,
    duration INT UNSIGNED DEFAULT 30 COMMENT 'Duration in minutes',
    booking_type ENUM('video_call', 'phone_call', 'in_person', 'chat') DEFAULT 'video_call',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    meeting_link VARCHAR(500) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_booking_number (booking_number),
    INDEX idx_user_id (user_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_case_id (case_id),
    INDEX idx_booking_time (booking_time),
    INDEX idx_status (status),
    
    CONSTRAINT fk_bookings_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_bookings_lawyer_id 
        FOREIGN KEY (lawyer_id) 
        REFERENCES lawyers(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_bookings_case_id 
        FOREIGN KEY (case_id) 
        REFERENCES cases(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Consultation bookings and appointments';

-- ============================================
-- TABLE 7: PAYMENTS
-- Payment transactions
-- ============================================
DROP TABLE IF EXISTS payments;

CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    transaction_id VARCHAR(100) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL,
    case_id BIGINT UNSIGNED NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    plan_type ENUM('consultation', 'case_filing', 'document_drafting', 'subscription', 'other') DEFAULT 'consultation',
    payment_method ENUM('card', 'upi', 'net_banking', 'wallet', 'cash') DEFAULT 'card',
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY uk_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_case_id (case_id),
    INDEX idx_status (status),
    INDEX idx_plan_type (plan_type),
    INDEX idx_payment_date (payment_date),
    
    CONSTRAINT fk_payments_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_payments_booking_id 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_payments_case_id 
        FOREIGN KEY (case_id) 
        REFERENCES cases(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Payment transactions and invoices';

-- ============================================
-- ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
-- ============================================

-- TABLE 8: REVIEWS
DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    lawyer_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    case_id BIGINT UNSIGNED NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    
    CONSTRAINT fk_reviews_lawyer_id 
        FOREIGN KEY (lawyer_id) 
        REFERENCES lawyers(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_reviews_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_reviews_case_id 
        FOREIGN KEY (case_id) 
        REFERENCES cases(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lawyer reviews and ratings';

-- TABLE 9: NOTIFICATIONS
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    
    CONSTRAINT fk_notifications_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User notifications';

-- ============================================
-- TRIGGERS FOR AUTOMATION
-- ============================================

-- Trigger: Auto-generate case number
DELIMITER $$
DROP TRIGGER IF EXISTS before_case_insert$$
CREATE TRIGGER before_case_insert
BEFORE INSERT ON cases
FOR EACH ROW
BEGIN
    IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
        SET NEW.case_number = CONCAT('CASE', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
    END IF;
END$$
DELIMITER ;

-- Trigger: Auto-generate booking number
DELIMITER $$
DROP TRIGGER IF EXISTS before_booking_insert$$
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        SET NEW.booking_number = CONCAT('BK', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 9999), 4, '0'));
    END IF;
END$$
DELIMITER ;

-- Trigger: Update lawyer rating after review
DELIMITER $$
DROP TRIGGER IF EXISTS after_review_insert$$
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE lawyers
    SET rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE lawyer_id = NEW.lawyer_id AND is_published = TRUE
    )
    WHERE id = NEW.lawyer_id;
END$$
DELIMITER ;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Active cases with details
DROP VIEW IF EXISTS active_cases_view;
CREATE VIEW active_cases_view AS
SELECT 
    c.id,
    c.case_number,
    c.title,
    c.status,
    c.priority,
    c.next_hearing_date,
    u.name AS client_name,
    u.email AS client_email,
    l.id AS lawyer_id,
    lu.name AS lawyer_name,
    l.specialization
FROM cases c
JOIN users u ON c.user_id = u.id
LEFT JOIN lawyers l ON c.lawyer_id = l.id
LEFT JOIN users lu ON l.user_id = lu.id
WHERE c.status IN ('pending', 'assigned', 'in_progress');

-- View: Lawyer statistics
DROP VIEW IF EXISTS lawyer_stats_view;
CREATE VIEW lawyer_stats_view AS
SELECT 
    l.id,
    l.user_id,
    u.name,
    l.specialization,
    l.rating,
    l.fee_per_hour,
    l.total_cases,
    COUNT(DISTINCT c.id) AS active_cases,
    COUNT(DISTINCT b.id) AS upcoming_bookings
FROM lawyers l
JOIN users u ON l.user_id = u.id
LEFT JOIN cases c ON l.id = c.lawyer_id AND c.status IN ('assigned', 'in_progress')
LEFT JOIN bookings b ON l.id = b.lawyer_id AND b.status = 'confirmed' AND b.booking_time > NOW()
GROUP BY l.id;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample users
INSERT INTO users (name, email, phone, password, user_type, is_verified) VALUES
('Admin User', 'admin@casexpert.com', '+919876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE),
('John Doe', 'john.doe@example.com', '+919876543211', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', TRUE),
('Jane Smith', 'jane.smith@example.com', '+919876543212', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', TRUE),
('Adv. Rajesh Kumar', 'rajesh.kumar@example.com', '+919876543213', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE),
('Adv. Priya Sharma', 'priya.sharma@example.com', '+919876543214', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lawyer', TRUE);

-- Insert sample lawyers
INSERT INTO lawyers (user_id, specialization, experience, languages, rating, fee_per_hour, city, state) VALUES
(4, 'Criminal Law', 10, 'English, Hindi, Marathi', 4.50, 2000.00, 'Mumbai', 'Maharashtra'),
(5, 'Family Law', 8, 'English, Hindi, Tamil', 4.80, 1800.00, 'Chennai', 'Tamil Nadu');

-- Insert sample cases
INSERT INTO cases (case_number, user_id, lawyer_id, title, description, case_type, status, priority) VALUES
('CASE2024000001', 2, 1, 'Property Dispute Case', 'Dispute regarding property ownership in Mumbai', 'Civil', 'assigned', 'high'),
('CASE2024000002', 3, 2, 'Divorce Case', 'Mutual consent divorce proceedings', 'Family', 'in_progress', 'medium'),
('CASE2024000003', 2, NULL, 'Consumer Rights Case', 'Consumer complaint against e-commerce company', 'Consumer', 'pending', 'low');

-- Insert sample bookings
INSERT INTO bookings (booking_number, user_id, lawyer_id, case_id, booking_time, duration, booking_type, status) VALUES
('BK20241128001', 2, 1, 1, '2024-12-01 10:00:00', 60, 'video_call', 'confirmed'),
('BK20241128002', 3, 2, 2, '2024-12-02 14:00:00', 45, 'in_person', 'confirmed');

-- Insert sample payments
INSERT INTO payments (transaction_id, user_id, booking_id, amount, plan_type, payment_method, status, payment_date) VALUES
('TXN2024112800001', 2, 1, 2000.00, 'consultation', 'upi', 'completed', NOW()),
('TXN2024112800002', 3, 2, 1800.00, 'consultation', 'card', 'completed', NOW());

-- Insert sample reviews
INSERT INTO reviews (lawyer_id, user_id, case_id, rating, review_text) VALUES
(1, 2, 1, 5, 'Excellent lawyer! Very professional and knowledgeable.'),
(2, 3, 2, 5, 'Highly recommended. Handled my case with great care.');

-- Insert sample chat messages
INSERT INTO chat (case_id, sender_id, receiver_id, message, message_type) VALUES
(1, 2, 4, 'Hello, I need help with my property case.', 'text'),
(1, 4, 2, 'Sure, I can help you. Please share the documents.', 'text'),
(2, 3, 5, 'When is our next hearing?', 'text'),
(2, 5, 3, 'The next hearing is scheduled for December 15th.', 'text');

-- ============================================
-- DATABASE VERIFICATION QUERIES
-- ============================================

-- Show all tables
SELECT 'Database created successfully!' AS Status;
SELECT 'Total tables created:' AS Info, COUNT(*) AS Count FROM information_schema.tables WHERE table_schema = 'casexpert_db';

-- Show table details
SELECT 
    table_name AS 'Table Name',
    table_rows AS 'Rows',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'casexpert_db'
ORDER BY table_name;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- NOTES:
-- 1. All passwords are hashed with bcrypt (password: admin123)
-- 2. All tables use InnoDB engine for transaction support
-- 3. UTF8MB4 charset for emoji and international character support
-- 4. Foreign keys with CASCADE on delete for data integrity
-- 5. Indexes on frequently queried columns for performance
-- 6. Triggers for auto-generation of case and booking numbers
-- 7. Views for common complex queries
-- 8. Sample data included for immediate testing

-- To use this schema:
-- 1. Open MySQL Workbench
-- 2. Create a new SQL tab
-- 3. Paste this entire script
-- 4. Click Execute (⚡ icon or Ctrl+Shift+Enter)
-- 5. Verify tables in the Schemas panel

-- Default admin credentials:
-- Email: admin@casexpert.com
-- Password: admin123
-- ⚠️ CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!
