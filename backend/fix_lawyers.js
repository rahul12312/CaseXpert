const { getDatabase, createDatabasePool } = require('./config/database');
const dotenv = require('dotenv');
dotenv.config();

async function fix() {
    await createDatabasePool();
    const db = getDatabase();
    try {
        const [result] = await db.query('UPDATE lawyers SET license_verified = 1');
        console.log('Update result:', result);
    } catch (err) {
        console.error('Fix failed:', err);
    } finally {
        process.exit();
    }
}

fix();
