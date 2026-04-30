const { getDatabase, createDatabasePool } = require('../config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixPasswords() {
    await createDatabasePool();
    const db = getDatabase();
    console.log('🔵 Fixing password hashes for all users...');

    try {
        // Correct bcrypt hash for 'password123' generated via bcryptjs
        const correctHash = '$2a$10$VdyHR0aiB.lvz3yXuRTgQeylPOPvTGb8F6uWqKfND8jv14ASgtqTe';
        
        const [result] = await db.query('UPDATE users SET password = ?', [correctHash]);
        console.log(`✅ Updated ${result.affectedRows} users with the correct password hash.`);
    } catch (err) {
        console.error('❌ Failed to update passwords:', err.message);
    }

    console.log('✨ Password fix complete.');
    process.exit();
}

fixPasswords();
