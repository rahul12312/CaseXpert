const { createDatabasePool } = require('./config/database');

async function checkSchema() {
    const pool = await createDatabasePool();
    try {
        const [rows] = await pool.query("DESCRIBE cases");
        console.log("Cases Table Schema:");
        rows.forEach(r => console.log(`${r.Field}: ${r.Type}`));

        const [hearings] = await pool.query("DESCRIBE case_hearings");
        console.log("\nHearings Table Schema:");
        hearings.forEach(r => console.log(`${r.Field}: ${r.Type}`));
    } catch (e) {
        console.error("Error checking schema:", e.message);
    }
    process.exit(0);
}

checkSchema();
