-- ============================================================================
-- LAWYER MARKETPLACE - QUICK SETUP SCRIPT
-- Run this single file to set up the entire marketplace
-- ============================================================================

USE casexpert_db;

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Practice Areas Table
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

-- Languages Table
CREATE TABLE IF NOT EXISTS languages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    language_name VARCHAR(50) NOT NULL UNIQUE,
    language_code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_language_name (language_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lawyer Practice Areas (Many-to-Many)
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

-- Lawyer Languages (Many-to-Many)
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

-- Lawyer Reviews
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
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    INDEX idx_is_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lawyer Availability
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
-- 2. ALTER LAWYERS TABLE
-- ============================================================================

-- Add new columns if they don't exist
SET @dbname = DATABASE();
SET @tablename = 'lawyers';

-- Bar Council ID
SET @columnname = 'bar_council_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) UNIQUE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Gender
SET @columnname = 'gender';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(\'Male\', \'Female\', \'Other\') DEFAULT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Consultation Fee
SET @columnname = 'consultation_fee';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(10,2) DEFAULT 0.00')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Is Verified
SET @columnname = 'is_verified';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Average Rating
SET @columnname = 'average_rating';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(2,1) DEFAULT 0.0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Total Reviews
SET @columnname = 'total_reviews';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT 0')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Success Rate
SET @columnname = 'success_rate';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(5,2) DEFAULT 0.00')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Is Available Today
SET @columnname = 'is_available_today';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT TRUE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Is Available This Week
SET @columnname = 'is_available_this_week';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT TRUE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Is 24/7 Support
SET @columnname = 'is_24_7_support';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Response Time
SET @columnname = 'response_time';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) DEFAULT \'Within 24 hours\'')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================================
-- 3. INSERT MASTER DATA
-- ============================================================================

-- Practice Areas
INSERT IGNORE INTO practice_areas (area_name, description, icon) VALUES
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
('Immigration', 'Visa, citizenship, immigration appeals', 'globe');

-- Languages
INSERT IGNORE INTO languages (language_name, language_code) VALUES
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
('Urdu', 'ur');

-- ============================================================================
-- 4. CREATE INDEXES
-- ============================================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_lawyer_city_rating ON lawyers(city, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_verified_rating ON lawyers(is_verified, average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_fee_rating ON lawyers(consultation_fee, average_rating DESC);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT '✅ Lawyer Marketplace Setup Complete!' as Status;
SELECT 'Run lawyer_marketplace_dummy_data.sql to add sample lawyers' as NextStep;
