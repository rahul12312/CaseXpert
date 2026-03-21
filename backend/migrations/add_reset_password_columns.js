const { createDatabasePool } = require('../config/database');
require('dotenv').config();

async function migrate() {
    console.log('🔄 Checking database for password reset columns...');

    try {
        const db = await createDatabasePool();
        if (!db) {
            throw new Error('Database connection failed');
        }

        // Check if columns exist
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME IN ('reset_password_token', 'reset_password_expire')
        `);

        if (columns.length === 2) {
            console.log('✅ Columns reset_password_token and reset_password_expire already exist.');
            process.exit(0);
        }

        // Add columns if they don't exist
        if (columns.length === 0) {
            console.log('➕ Adding reset_password_token and reset_password_expire columns...');
            await db.query(`
                ALTER TABLE users 
                ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL,
                ADD COLUMN reset_password_expire DATETIME DEFAULT NULL
            `);
            console.log('✅ Columns added successfully.');
        } else {
            // Handle partial existence (rare but possible)
            const missingColumns = [];
            const existingNames = columns.map(c => c.COLUMN_NAME);

            if (!existingNames.includes('reset_password_token')) {
                console.log('➕ Adding reset_password_token column...');
                await db.query('ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL');
            }
            if (!existingNames.includes('reset_password_expire')) {
                console.log('➕ Adding reset_password_expire column...');
                await db.query('ALTER TABLE users ADD COLUMN reset_password_expire DATETIME DEFAULT NULL');
            }
            console.log('✅ Missing columns added successfully.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
