require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'casexpert',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function setup() {
    try {
        console.log('🔌 Connecting to database...');
        const connection = await pool.getConnection();

        console.log('🛠️ Creating user_documents table...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_documents (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                document_type VARCHAR(50) DEFAULT 'uploaded', -- 'draft', 'uploaded'
                file_type VARCHAR(50), -- 'pdf', 'docx', etc.
                mime_type VARCHAR(100),
                file_size BIGINT,
                s3_key VARCHAR(512),
                description TEXT,
                is_archived BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Check if table created
        const [tables] = await connection.query("SHOW TABLES LIKE 'user_documents'");
        if (tables.length > 0) {
            console.log('✅ user_documents table is ready');
        } else {
            console.error('❌ Failed to create table');
        }

        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

setup();
