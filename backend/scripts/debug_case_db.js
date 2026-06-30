// Simple case creation debug script
const { createDatabasePool, getDatabase } = require('./config/database');

async function debug() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log('✅ Database connected');

        // Check users
        const [users] = await db.query("SELECT id, name, email, user_type FROM users WHERE user_type IN ('user', 'client') LIMIT 3");
        console.log('\n📊 Available users:');
        console.table(users);

        // Check lawyers
        const [lawyers] = await db.query("SELECT id, name, email, verification_status FROM lawyers WHERE verification_status = 'verified' LIMIT 3");
        console.log('\n📊 Verified lawyers:');
        console.table(lawyers);

        // Check recent cases
        const [cases] = await db.query("SELECT id, title, case_number, user_id, lawyer_id, status, created_at FROM cases ORDER BY created_at DESC LIMIT 5");
        console.log('\n📊 Recent cases:');
        console.table(cases);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debug();
