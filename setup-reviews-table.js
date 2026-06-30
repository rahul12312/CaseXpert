const { createDatabasePool, getDatabase } = require('./config/database');

async function setupReviewsTable() {
    console.log('🛠️ Setting up Reviews Table...');

    try {
        await createDatabasePool();
        const pool = getDatabase();

        // Create reviews table
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lawyer_id INT NOT NULL,
        user_id INT NOT NULL,
        rating DECIMAL(3, 1) NOT NULL,
        review_title VARCHAR(255),
        review_text TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

        await pool.query(createTableSQL);
        console.log('✅ Reviews table created or already exists.');

        // Check availability columns in lawyers table? (Optional, just to be safe about schema)

    } catch (error) {
        console.error('❌ Error creating reviews table:', error);
    } finally {
        process.exit(0);
    }
}

setupReviewsTable();
