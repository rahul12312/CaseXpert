-- ============================================================================
-- Ensure all Case Tracking Tables Exist
-- ============================================================================

-- 2. CASE UPDATES TABLE
CREATE TABLE IF NOT EXISTS case_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    update_title VARCHAR(255) NOT NULL,
    update_description TEXT,
    update_type ENUM('status-change', 'document-upload', 'hearing-update', 'general-update', 'evidence-update', 'lawyer-note') NOT NULL DEFAULT 'general-update',
    created_by VARCHAR(100) NOT NULL, 
    created_by_role ENUM('user', 'lawyer', 'admin', 'system') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CASE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS case_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50), 
    file_size INT,
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_by_role ENUM('user', 'lawyer', 'admin') NOT NULL DEFAULT 'user',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CASE TIMELINE TABLE
CREATE TABLE IF NOT EXISTS case_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_type ENUM('case-created', 'status-change', 'hearing', 'submission', 'document-upload', 'evidence', 'judgment', 'other') NOT NULL DEFAULT 'other',
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CASE ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS case_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    activity TEXT NOT NULL, 
    actor_name VARCHAR(100) NOT NULL, 
    actor_role ENUM('user', 'lawyer', 'admin', 'system') NOT NULL DEFAULT 'user',
    activity_type ENUM('create', 'update', 'status-change', 'document-upload', 'timeline-add', 'comment', 'delete', 'other') NOT NULL DEFAULT 'other',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
