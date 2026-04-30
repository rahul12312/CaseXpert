-- ============================================================================
-- LAWYER MARKETPLACE DATABASE SCHEMA
-- Enhanced schema for CaseXpert Lawyer Marketplace Feature
-- ============================================================================

USE casexpert_db;

-- ============================================================================
-- 1. PRACTICE AREAS TABLE (Master Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS practice_areas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_area_name (area_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. LANGUAGES TABLE (Master Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS languages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(50) NOT NULL UNIQUE,
    language_code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_language_name (language_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. LAWYER PRACTICE AREAS (Many-to-Many Relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lawyer_practice_areas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id BIGINT UNSIGNED NOT NULL,
    practice_area_id INT UNSIGNED NOT NULL,
    years_of_experience INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    FOREIGN KEY (practice_area_id) REFERENCES practice_areas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lawyer_practice (lawyer_id, practice_area_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_practice_area_id (practice_area_id),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. LAWYER LANGUAGES (Many-to-Many Relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lawyer_languages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id BIGINT UNSIGNED NOT NULL,
    language_id INT UNSIGNED NOT NULL,
    proficiency_level ENUM('Basic', 'Intermediate', 'Fluent', 'Native') DEFAULT 'Fluent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lawyer_language (lawyer_id, language_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_language_id (language_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. LAWYER REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lawyer_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_title VARCHAR(200),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    INDEX idx_is_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. LAWYER AVAILABILITY SCHEDULE
-- ============================================================================
CREATE TABLE IF NOT EXISTS lawyer_availability (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lawyer_id BIGINT UNSIGNED NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. ALTER LAWYERS TABLE - Add new fields for marketplace
-- ============================================================================
ALTER TABLE lawyers 
ADD COLUMN IF NOT EXISTS bar_council_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS bar_council_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS enrollment_year YEAR,
ADD COLUMN IF NOT EXISTS gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS profile_completion INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS response_time VARCHAR(50) DEFAULT 'Within 24 hours',
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_available_today BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_available_this_week BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_24_7_support BOOLEAN DEFAULT FALSE,
ADD INDEX IF NOT EXISTS idx_bar_council_id (bar_council_id),
ADD INDEX IF NOT EXISTS idx_gender (gender),
ADD INDEX IF NOT EXISTS idx_is_verified (is_verified),
ADD INDEX IF NOT EXISTS idx_consultation_fee (consultation_fee),
ADD INDEX IF NOT EXISTS idx_average_rating (average_rating);

-- ============================================================================
-- INSERT MASTER DATA - Practice Areas
-- ============================================================================
INSERT INTO practice_areas (area_name, description, icon) VALUES
('Family Law', 'Divorce, child custody, alimony, adoption', 'family'),
('Criminal Law', 'Criminal defense, bail, appeals', 'gavel'),
('Property Law', 'Real estate, land disputes, property registration', 'home'),
('Divorce', 'Divorce proceedings, mutual consent, contested divorce', 'broken-heart'),
('Civil Law', 'Civil disputes, contracts, torts', 'balance'),
('Corporate Law', 'Company law, mergers, acquisitions, compliance', 'briefcase'),
('Labour Law', 'Employment disputes, labor rights, workplace issues', 'users'),
('Consumer Law', 'Consumer rights, product liability, fraud', 'shopping-cart'),
('Taxation', 'Income tax, GST, tax disputes', 'calculator'),
('Cyber Law', 'Cybercrime, data protection, IT Act', 'shield'),
('Insurance Law', 'Insurance claims, disputes, policy matters', 'umbrella'),
('Immigration', 'Visa, citizenship, immigration appeals', 'globe')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ============================================================================
-- INSERT MASTER DATA - Languages
-- ============================================================================
INSERT INTO languages (language_name, language_code) VALUES
('English', 'en'),
('Hindi', 'hi'),
('Marathi', 'mr'),
('Gujarati', 'gu'),
('Tamil', 'ta'),
('Telugu', 'te'),
('Kannada', 'kn'),
('Bengali', 'bn'),
('Punjabi', 'pa'),
('Malayalam', 'ml'),
('Urdu', 'ur')
ON DUPLICATE KEY UPDATE language_name = VALUES(language_name);

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- Comprehensive Lawyer View with all details
CREATE OR REPLACE VIEW vw_lawyer_marketplace AS
SELECT 
    l.id,
    l.user_id,
    u.name,
    u.email,
    u.phone,
    u.profile_image,
    l.bar_council_id,
    l.bar_council_state,
    l.enrollment_year,
    l.gender,
    l.experience,
    l.consultation_fee,
    l.bio,
    l.city,
    l.state,
    l.is_verified,
    l.verification_date,
    l.average_rating,
    l.total_reviews,
    l.total_cases,
    l.success_rate,
    l.availability_status,
    l.is_available_today,
    l.is_available_this_week,
    l.is_24_7_support,
    l.response_time,
    l.profile_completion,
    l.created_at,
    l.updated_at,
    -- Aggregate practice areas
    GROUP_CONCAT(DISTINCT pa.area_name ORDER BY lpa.is_primary DESC, pa.area_name SEPARATOR ', ') as practice_areas,
    -- Aggregate languages
    GROUP_CONCAT(DISTINCT lang.language_name ORDER BY lang.language_name SEPARATOR ', ') as languages
FROM lawyers l
INNER JOIN users u ON l.user_id = u.id
LEFT JOIN lawyer_practice_areas lpa ON l.id = lpa.lawyer_id
LEFT JOIN practice_areas pa ON lpa.practice_area_id = pa.id AND pa.is_active = TRUE
LEFT JOIN lawyer_languages ll ON l.id = ll.lawyer_id
LEFT JOIN languages lang ON ll.language_id = lang.id AND lang.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY l.id;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Procedure to update lawyer rating
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_update_lawyer_rating(IN p_lawyer_id BIGINT)
BEGIN
    UPDATE lawyers 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM lawyer_reviews 
            WHERE lawyer_id = p_lawyer_id AND is_approved = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM lawyer_reviews 
            WHERE lawyer_id = p_lawyer_id AND is_approved = TRUE
        )
    WHERE id = p_lawyer_id;
END //
DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update lawyer rating after review insert
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_review_insert
AFTER INSERT ON lawyer_reviews
FOR EACH ROW
BEGIN
    CALL sp_update_lawyer_rating(NEW.lawyer_id);
END //
DELIMITER ;

-- Trigger to update lawyer rating after review update
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_review_update
AFTER UPDATE ON lawyer_reviews
FOR EACH ROW
BEGIN
    CALL sp_update_lawyer_rating(NEW.lawyer_id);
END //
DELIMITER ;

-- Trigger to update lawyer rating after review delete
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_review_delete
AFTER DELETE ON lawyer_reviews
FOR EACH ROW
BEGIN
    CALL sp_update_lawyer_rating(OLD.lawyer_id);
END //
DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lawyer_city_rating ON lawyers(city, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_verified_rating ON lawyers(is_verified, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_fee_rating ON lawyers(consultation_fee, average_rating DESC);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
SELECT 'Lawyer Marketplace Schema Created Successfully!' as Status;
