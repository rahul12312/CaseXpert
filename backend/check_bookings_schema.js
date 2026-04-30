const { createDatabasePool } = require('./config/database');

async function checkSchema() {
    await createDatabasePool();
    const { getDatabase } = require('./config/database');
    const pool = getDatabase();
    try {
        const [rows] = await pool.query('DESCRIBE bookings');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
