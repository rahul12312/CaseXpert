const fs = require('fs');
const path = require('path');
const { createDatabasePool } = require('./config/database');

async function runMissingTables() {
    const pool = await createDatabasePool();

    const sqlPath = path.join(__dirname, '../database/create_missing_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon (naive split, but works for this file)
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    const connection = await pool.getConnection();
    try {
        for (const statement of statements) {
            console.log(`Executing table creation...`);
            try {
                await connection.query(statement);
                console.log("Success.");
            } catch (e) {
                console.error("Error:", e.message);
            }
        }
        console.log("Done.");
    } finally {
        connection.release();
        process.exit(0);
    }
}

runMissingTables();
