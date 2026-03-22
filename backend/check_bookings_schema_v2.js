const { createDatabasePool, getDatabase } = require('./config/database');

async function checkSchema() {
    try {
        console.log('Connecting...');
        await createDatabasePool();
        const pool = getDatabase();
        console.log('Querying...');
        const [rows] = await pool.query('DESCRIBE bookings');
        console.log('RESULTS_START');
        console.log(JSON.stringify(rows));
        console.log('RESULTS_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
