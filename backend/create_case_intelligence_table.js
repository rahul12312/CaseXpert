const { createDatabasePool, getDatabase } = require('./config/database');

async function createCaseIntelligenceTable() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log("Creating 'case_intelligence' table...");

        const query = `
            CREATE TABLE IF NOT EXISTS case_intelligence (
                id INT AUTO_INCREMENT PRIMARY KEY,
                case_id BIGINT UNSIGNED NOT NULL,
                report_data LONGTEXT,
                risk_score INT,
                summary TEXT,
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
                INDEX idx_case_id (case_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

        await db.query(query);
        console.log("✅ Successfully created 'case_intelligence' table.");

        process.exit(0);
    } catch (e) {
        console.error("Error creating table:", e);
        process.exit(1);
    }
}

createCaseIntelligenceTable();
