/**
 * Database Migration: Add language preference to users table
 * Run this file to update your database schema
 */

const { getDatabase } = require('../config/database');

async function addLanguagePreference() {
    console.log('🔄 Adding language preference column to users table...');

    try {
        const database = getDatabase();

        if (!database) {
            throw new Error('Database connection not available');
        }

        // Check if column already exists
        const [columns] = await database.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'preferred_language'
    `);

        if (columns.length > 0) {
            console.log('✅ Column preferred_language already exists');
            return;
        }

        // Add preferred_language column
        await database.query(`
      ALTER TABLE users 
      ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'en' AFTER email
    `);

        console.log('✅ Added preferred_language column');

        // Add timezone column (optional, for future use)
        const [tzColumns] = await database.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'timezone'
    `);

        if (tzColumns.length === 0) {
            await database.query(`
        ALTER TABLE users 
        ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Kolkata' AFTER preferred_language
      `);
            console.log('✅ Added timezone column');
        } else {
            console.log('✅ Column timezone already exists');
        }

        // Add index for better query performance
        await database.query(`
      ALTER TABLE users 
      ADD INDEX idx_preferred_language (preferred_language)
    `).catch(() => {
            console.log('⚠️ Index might already exist, skipping...');
        });

        console.log('✅ Migration completed successfully');
        console.log('📊 You can now store user language preferences!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

// Run migration if executed directly
if (require.main === module) {
    addLanguagePreference()
        .then(() => {
            console.log('\n✅ All done! Database schema updated.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addLanguagePreference };
