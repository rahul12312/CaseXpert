-- ============================================
-- CaseXpert Database Schema
-- MySQL Database for Legal Platform
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS casexpert_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE casexpert_db;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('client', 'lawyer', 'admin') DEFAULT 'client',
    profile_image VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_user_type (user_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. LAWYERS TABLE
-- ============================================
CREATE TABLE lawyers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    specialization VARCHAR(255) NOT NULL,
    sub_specializations JSON,
    experience INT UNSIGNED DEFAULT 0 COMMENT 'Years of experience',
    languages JSON COMMENT 'Array of languages spoken',
    bar_council_number VARCHAR(100) UNIQUE,
    license_verified BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INT UNSIGNED DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    bio TEXT,
    education JSON COMMENT 'Array of education details',
    certifications JSON COMMENT 'Array of certifications',
    office_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    courts JSON COMMENT 'Array of courts practiced in',
    total_cases_handled INT UNSIGNED DEFAULT 0,
    total_consultations INT UNSIGNED DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_specialization (specialization),
    INDEX idx_rating (rating),
    INDEX idx_experience (experience),
    INDEX idx_city (city),
    INDEX idx_state (state),
    INDEX idx_availability (availability_status),
    INDEX idx_is_premium (is_premium),
    FULLTEXT idx_bio (bio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. CASES TABLE
-- ============================================
CREATE TABLE cases (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Client ID',
    lawyer_id BIGINT UNSIGNED NULL COMMENT 'Assigned lawyer',
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    case_type VARCHAR(100) COMMENT 'Criminal, Civil, Family, etc.',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled') DEFAULT 'pending',
    court_name VARCHAR(255),
    case_filing_date DATE,
    next_hearing_date DATETIME,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    case_value DECIMAL(15,2),
    is_confidential BOOLEAN DEFAULT FALSE,
    tags JSON COMMENT 'Array of tags for categorization',
    metadata JSON COMMENT 'Additional case metadata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL,
    
    INDEX idx_case_number (case_number),
    INDEX idx_user_id (user_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_status (status),
    INDEX idx_case_type (case_type),
    INDEX idx_priority (priority),
    INDEX idx_next_hearing (next_hearing_date),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED NOT NULL COMMENT 'User ID who uploaded',
    document_type ENUM('evidence', 'contract', 'affidavit', 'petition', 'notice', 'order', 'other') DEFAULT 'other',
    file_name VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_size BIGINT UNSIGNED COMMENT 'Size in bytes',
    file_type VARCHAR(100) COMMENT 'MIME type',
    document_title VARCHAR(500),
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT UNSIGNED NULL,
    verified_at TIMESTAMP NULL,
    access_level ENUM('public', 'private', 'restricted') DEFAULT 'private',
    version INT UNSIGNED DEFAULT 1,
    parent_document_id BIGINT UNSIGNED NULL COMMENT 'For document versioning',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_document_id) REFERENCES documents(id) ON DELETE SET NULL,
    
    INDEX idx_case_id (case_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_document_type (document_type),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_access_level (access_level),
    FULLTEXT idx_document_title (document_title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. CHAT/MESSAGES TABLE
-- ============================================
CREATE TABLE chat (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'file', 'image', 'audio', 'video', 'system') DEFAULT 'text',
    attachment_url VARCHAR(1000),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    parent_message_id BIGINT UNSIGNED NULL COMMENT 'For threaded replies',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_message_id) REFERENCES chat(id) ON DELETE SET NULL,
    
    INDEX idx_case_id (case_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_message_type (message_type),
    FULLTEXT idx_message (message)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. BOOKINGS/CONSULTATIONS TABLE
-- ============================================
CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Client ID',
    lawyer_id BIGINT UNSIGNED NOT NULL,
    case_id BIGINT UNSIGNED NULL COMMENT 'Optional: Link to case',
    booking_type ENUM('video_call', 'phone_call', 'in_person', 'chat') DEFAULT 'video_call',
    booking_time DATETIME NOT NULL,
    duration INT UNSIGNED DEFAULT 30 COMMENT 'Duration in minutes',
    end_time DATETIME GENERATED ALWAYS AS (DATE_ADD(booking_time, INTERVAL duration MINUTE)) STORED,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    meeting_link VARCHAR(500),
    meeting_room_id VARCHAR(100),
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by BIGINT UNSIGNED NULL,
    cancelled_at TIMESTAMP NULL,
    reminder_sent BOOLEAN DEFAULT FALSE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_booking_number (booking_number),
    INDEX idx_user_id (user_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_case_id (case_id),
    INDEX idx_booking_time (booking_time),
    INDEX idx_status (status),
    INDEX idx_booking_type (booking_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL,
    case_id BIGINT UNSIGNED NULL,
    lawyer_id BIGINT UNSIGNED NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    plan_type ENUM('consultation', 'case_filing', 'document_drafting', 'subscription', 'premium', 'other') DEFAULT 'consultation',
    payment_method ENUM('card', 'upi', 'net_banking', 'wallet', 'cash', 'other') DEFAULT 'card',
    payment_gateway VARCHAR(50) COMMENT 'Razorpay, Stripe, PayPal, etc.',
    gateway_transaction_id VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    refund_date TIMESTAMP NULL,
    refund_reason TEXT,
    invoice_number VARCHAR(100) UNIQUE,
    invoice_url VARCHAR(500),
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + tax_amount - discount_amount) STORED,
    metadata JSON COMMENT 'Additional payment metadata',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_case_id (case_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_status (status),
    INDEX idx_plan_type (plan_type),
    INDEX idx_payment_date (payment_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
-- ============================================

-- Reviews and Ratings Table
CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    case_id BIGINT UNSIGNED NULL,
    booking_id BIGINT UNSIGNED NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    helpful_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_lawyer_case (user_id, lawyer_id, case_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_review (review_title, review_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'case_update, booking_reminder, payment, message, etc.',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT UNSIGNED NULL COMMENT 'ID of related entity',
    related_type VARCHAR(50) NULL COMMENT 'case, booking, payment, etc.',
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table (Audit Trail)
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) COMMENT 'user, case, booking, payment, etc.',
    entity_id BIGINT UNSIGNED NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password Reset Tokens
CREATE TABLE password_resets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Verification Tokens
CREATE TABLE email_verifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================

-- Update lawyer rating when new review is added
DELIMITER //
CREATE TRIGGER update_lawyer_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE lawyers
    SET rating = (
        SELECT AVG(rating)
        FROM reviews
        WHERE lawyer_id = NEW.lawyer_id AND is_published = TRUE
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE lawyer_id = NEW.lawyer_id AND is_published = TRUE
    )
    WHERE id = NEW.lawyer_id;
END//
DELIMITER ;

-- Auto-generate case number
DELIMITER //
CREATE TRIGGER generate_case_number
BEFORE INSERT ON cases
FOR EACH ROW
BEGIN
    IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
        SET NEW.case_number = CONCAT('CASE', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
    END IF;
END//
DELIMITER ;

-- Auto-generate booking number
DELIMITER //
CREATE TRIGGER generate_booking_number
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
        SET NEW.booking_number = CONCAT('BK', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 9999), 4, '0'));
    END IF;
END//
DELIMITER ;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active Cases View
CREATE VIEW active_cases AS
SELECT 
    c.*,
    u.name as client_name,
    u.email as client_email,
    l.id as lawyer_id,
    lu.name as lawyer_name,
    l.specialization
FROM cases c
JOIN users u ON c.user_id = u.id
LEFT JOIN lawyers l ON c.lawyer_id = l.id
LEFT JOIN users lu ON l.user_id = lu.id
WHERE c.status IN ('pending', 'assigned', 'in_progress');

-- Lawyer Statistics View
CREATE VIEW lawyer_stats AS
SELECT 
    l.id,
    l.user_id,
    u.name,
    l.specialization,
    l.rating,
    l.total_reviews,
    l.total_cases_handled,
    l.success_rate,
    COUNT(DISTINCT c.id) as active_cases,
    COUNT(DISTINCT b.id) as upcoming_bookings,
    SUM(p.amount) as total_earnings
FROM lawyers l
JOIN users u ON l.user_id = u.id
LEFT JOIN cases c ON l.id = c.lawyer_id AND c.status IN ('assigned', 'in_progress')
LEFT JOIN bookings b ON l.id = b.lawyer_id AND b.status = 'confirmed' AND b.booking_time > NOW()
LEFT JOIN payments p ON l.id = p.lawyer_id AND p.status = 'completed'
GROUP BY l.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Get lawyer availability
DELIMITER //
CREATE PROCEDURE get_lawyer_availability(
    IN p_lawyer_id BIGINT,
    IN p_date DATE
)
BEGIN
    SELECT 
        b.booking_time,
        b.duration,
        b.end_time
    FROM bookings b
    WHERE b.lawyer_id = p_lawyer_id
    AND DATE(b.booking_time) = p_date
    AND b.status IN ('confirmed', 'in_progress')
    ORDER BY b.booking_time;
END//
DELIMITER ;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, phone, password, user_type, is_verified, is_active) VALUES
('Admin User', 'admin@casexpert.com', '+919876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE, TRUE);

-- ============================================
-- SECURITY BEST PRACTICES APPLIED
-- ============================================
-- 1. Foreign key constraints for referential integrity
-- 2. Indexes on frequently queried columns
-- 3. ENUM types for predefined values
-- 4. Proper data types (BIGINT for IDs, DECIMAL for money)
-- 5. Timestamps for audit trails
-- 6. Soft deletes capability (is_deleted flags)
-- 7. UTF8MB4 for emoji and international character support
-- 8. Generated columns for computed values
-- 9. Unique constraints where needed
-- 10. CHECK constraints for data validation
-- 11. Fulltext indexes for search functionality
-- 12. Triggers for automated updates
-- 13. Views for complex queries
-- 14. Stored procedures for business logic

-- ============================================
-- END OF SCHEMA
-- ============================================
