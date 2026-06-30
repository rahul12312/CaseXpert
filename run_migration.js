const fs = require('fs');
const path = require('path');
const { createDatabasePool } = require('./config/database');

async function runMigration() {
    const pool = await createDatabasePool();
    if (!pool) {
        console.error("Failed to connect to DB");
        process.exit(1);
    }

    const sqlPath = path.join(__dirname, '../database/update_case_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon to run multiple statements
    const statements = sql.split(';').filter(s => s.trim());

    console.log(`Found ${statements.length} statements to execute.`);

    const connection = await pool.getConnection();
    try {
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                try {
                    await connection.query(statement);
                    console.log("Success.");
                } catch (e) {
                    if (e.code === 'ER_DUP_FIELDNAME') {
                        console.log("Column already exists, skipping.");
                    } else {
                        console.error("Error executing statement:", e.message);
                    }
                }
            }
        }
        console.log("Migration completed.");
    } finally {
        connection.release();
        process.exit(0);
    }
}

runMigration();
