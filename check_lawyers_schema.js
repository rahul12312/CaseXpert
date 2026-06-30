const { createDatabasePool, getDatabase } = require('./config/database');

async function checkSchema() {
    try {
        await createDatabasePool();
        const pool = getDatabase();
        const [rows] = await pool.query('DESCRIBE lawyers');
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
