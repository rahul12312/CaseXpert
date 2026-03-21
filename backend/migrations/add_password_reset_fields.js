const { getDatabase } = require('../config/database');

/**
 * Migration: Add Password Reset Fields to Users Table
 * Adds resetPasswordToken and resetPasswordExpire fields
 */
async function addPasswordResetFields() {
    const db = getDatabase();

    try {
        console.log('🔄 Adding password reset fields to users table...');

        // Check if resetPasswordToken column exists
        const [tokenColumn] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'resetPasswordToken'
    `);

        if (tokenColumn.length === 0) {
            await db.query(`
        ALTER TABLE users 
        ADD COLUMN resetPasswordToken VARCHAR(255) DEFAULT NULL
      `);
            console.log('   ✓ Added resetPasswordToken column');
        } else {
            console.log('   ✓ resetPasswordToken column already exists');
        }

        // Check if resetPasswordExpire column exists
        const [expireColumn] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'resetPasswordExpire'
    `);

        if (expireColumn.length === 0) {
            await db.query(`
        ALTER TABLE users 
        ADD COLUMN resetPasswordExpire DATETIME DEFAULT NULL
      `);
            console.log('   ✓ Added resetPasswordExpire column');
        } else {
            console.log('   ✓ resetPasswordExpire column already exists');
        }

        console.log('✅ Password reset fields migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

// Run migration if executed directly
if (require.main === module) {
    const { createDatabasePool } = require('../config/database');

    createDatabasePool()
        .then(() => addPasswordResetFields())
        .then(() => {
            console.log('✅ Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Migration error:', error);
            process.exit(1);
        });
}

module.exports = addPasswordResetFields;
