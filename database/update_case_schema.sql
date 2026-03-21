-- Add new columns to cases table (if they don't exist, this might error but we catch it)
ALTER TABLE cases
ADD COLUMN court_name VARCHAR(255) NULL AFTER case_type,
ADD COLUMN filing_date DATE NULL AFTER court_name,
ADD COLUMN opponent_name VARCHAR(255) NULL AFTER filing_date,
ADD COLUMN opponent_lawyer VARCHAR(255) NULL AFTER opponent_name;

-- Create Hearings Table
CREATE TABLE IF NOT EXISTS case_hearings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    hearing_date DATETIME NOT NULL,
    purpose ENUM('Admission', 'Evidence', 'Argument', 'Order', 'Other') NOT NULL DEFAULT 'Other',
    courtroom VARCHAR(100),
    judge_name VARCHAR(255),
    outcome TEXT,
    next_hearing_date DATE,
    next_hearing_purpose VARCHAR(255),
    adjournment_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    INDEX idx_hearing_case (case_id),
    INDEX idx_hearing_date (hearing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
