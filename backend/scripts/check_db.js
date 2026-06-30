const { getDatabase, createDatabasePool } = require('./config/database');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    await createDatabasePool();
    const db = getDatabase();
    try {
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables:', tables);

        const [lawyers] = await db.query('SELECT * FROM lawyers LIMIT 1');
        console.log('Lawyer Row Example:', lawyers[0]);

        const [lawyerCols] = await db.query('DESCRIBE lawyers');
        console.log('Lawyers Columns:', lawyerCols.map(c => `${c.Field} (${c.Type})`));

        const [userCols] = await db.query('DESCRIBE users');
        console.log('Users Columns:', userCols.map(c => `${c.Field} (${c.Type})`));

        const [bookingCols] = await db.query('DESCRIBE bookings');
        console.log('Bookings Columns:', bookingCols.map(c => `${c.Field} (${c.Type})`));

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

check();
