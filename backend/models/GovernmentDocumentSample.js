// ============================================================================
// Government Document Sample Model
// Professional, legally-sourced document samples
// ============================================================================

const { getDatabase } = require('../config/database');

/**
 * Government Document Sample Schema
 * 
 * This model represents official government document templates
 * sourced from trusted government portals and legal authorities.
 */
const GovernmentDocumentSample = {
    tableName: 'government_document_samples',

    /**
     * Create the table if it doesn't exist
     */
    async createTable() {
        const db = getDatabase();

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS government_document_samples (
                id INT PRIMARY KEY AUTO_INCREMENT,
                
                -- Document Information
                document_type VARCHAR(100) NOT NULL,
                document_title VARCHAR(255) NOT NULL,
                document_category ENUM(
                    'Affidavit',
                    'RTI_Application',
                    'Legal_Notice',
                    'Agreement',
                    'Power_of_Attorney',
                    'Will',
                    'Petition',
                    'Application',
                    'Notarized_Document',
                    'Other'
                ) NOT NULL,
                
                -- Official Source Information
                authority_source VARCHAR(255) NOT NULL COMMENT 'e.g., Government of India, Supreme Court',
                source_url TEXT COMMENT 'Original URL where document was obtained',
                issuing_department VARCHAR(255) COMMENT 'e.g., Ministry of Law, State High Court',
                
                -- Document Storage
                sample_pdf_url TEXT NOT NULL COMMENT 'Cloud storage URL (AWS S3 / GCP / Azure)',
                file_size_kb INT COMMENT 'File size in kilobytes',
                
                -- Metadata
                description TEXT COMMENT 'Brief description of the document',
                language ENUM('English', 'Hindi', 'Both') DEFAULT 'English',
                applicable_acts TEXT COMMENT 'Relevant legal acts/laws',
                
                -- Compliance & Verification
                last_verified_date DATE NOT NULL,
                verification_status ENUM('Verified', 'Pending', 'Outdated') DEFAULT 'Verified',
                disclaimer TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                
                -- Usage Analytics
                view_count INT DEFAULT 0,
                download_count INT DEFAULT 0,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Indexes for performance
                INDEX idx_document_type (document_type),
                INDEX idx_category (document_category),
                INDEX idx_verification (verification_status, is_active),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        try {
            await db.execute(createTableSQL);
            console.log('✅ Government Document Samples table created/verified');
            return true;
        } catch (error) {
            console.error('❌ Error creating government_document_samples table:', error);
            throw error;
        }
    },

    /**
     * Find all active document samples
     */
    async findAll(filters = {}) {
        const db = getDatabase();

        let query = 'SELECT * FROM government_document_samples WHERE is_active = 1';
        const params = [];

        if (filters.category) {
            query += ' AND document_category = ?';
            params.push(filters.category);
        }

        if (filters.documentType) {
            query += ' AND document_type = ?';
            params.push(filters.documentType);
        }

        if (filters.language) {
            query += ' AND language = ?';
            params.push(filters.language);
        }

        query += ' ORDER BY document_title ASC';

        const [rows] = await db.execute(query, params);
        return rows;
    },

    /**
     * Find a specific document sample by type
     */
    async findByType(documentType) {
        const db = getDatabase();
        const [rows] = await db.execute(
            'SELECT * FROM government_document_samples WHERE document_type = ? AND is_active = 1 LIMIT 1',
            [documentType]
        );
        return rows[0] || null;
    },

    /**
     * Find a document sample by ID
     */
    async findById(id) {
        const db = getDatabase();
        const [rows] = await db.execute(
            'SELECT * FROM government_document_samples WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * Create a new document sample
     */
    async create(sampleData) {
        const db = getDatabase();

        const {
            document_type,
            document_title,
            document_category,
            authority_source,
            source_url,
            issuing_department,
            sample_pdf_url,
            file_size_kb,
            description,
            language,
            applicable_acts,
            last_verified_date,
            disclaimer
        } = sampleData;

        const [result] = await db.execute(
            `INSERT INTO government_document_samples 
            (document_type, document_title, document_category, authority_source, 
             source_url, issuing_department, sample_pdf_url, file_size_kb, description, 
             language, applicable_acts, last_verified_date, disclaimer)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                document_type,
                document_title,
                document_category,
                authority_source,
                source_url || null,
                issuing_department || null,
                sample_pdf_url,
                file_size_kb || null,
                description || null,
                language || 'English',
                applicable_acts || null,
                last_verified_date,
                disclaimer
            ]
        );

        return result.insertId;
    },

    /**
     * Update view count (analytics)
     */
    async incrementViewCount(id) {
        const db = getDatabase();
        await db.execute(
            'UPDATE government_document_samples SET view_count = view_count + 1 WHERE id = ?',
            [id]
        );
    },

    /**
     * Update download count (analytics)
     */
    async incrementDownloadCount(id) {
        const db = getDatabase();
        await db.execute(
            'UPDATE government_document_samples SET download_count = download_count + 1 WHERE id = ?',
            [id]
        );
    },

    /**
     * Update verification status
     */
    async updateVerification(id, status, date) {
        const db = getDatabase();
        await db.execute(
            'UPDATE government_document_samples SET verification_status = ?, last_verified_date = ? WHERE id = ?',
            [status, date, id]
        );
    }
};

module.exports = GovernmentDocumentSample;
