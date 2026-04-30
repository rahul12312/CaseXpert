const { createDatabasePool } = require('./config/database');

async function debugStatus() {
    const pool = await createDatabasePool();
    try {
        const [rows] = await pool.query("SHOW COLUMNS FROM cases LIKE 'status'");
        console.log("Status Column:", rows);

        const [typeRows] = await pool.query("SHOW COLUMNS FROM cases LIKE 'case_type'");
        console.log("Case Type Column:", typeRows);

        const [prioRows] = await pool.query("SHOW COLUMNS FROM cases LIKE 'priority'");
        console.log("Priority Column:", prioRows);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

debugStatus();
