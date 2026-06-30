// Check lawyers table structure
const { createDatabasePool, getDatabase } = require('./config/database');

async function checkSchema() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log('Checking lawyers table structure...\n');
        const [columns] = await db.query('DESCRIBE lawyers');
        console.table(columns);

        console.log('\nChecking users table structure...\n');
        const [userColumns] = await db.query('DESCRIBE users');
        console.table(userColumns);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
