const { createDatabasePool, getDatabase } = require('./config/database');

async function fixSchema() {
    try {
        await createDatabasePool();
        const db = getDatabase();
        if (!db) {
            console.error('Failed to get database connection');
            process.exit(1);
        }

        console.log('Adding verification_status to lawyers table...');

        // Check if column exists first
        try {
            const [rows] = await db.execute("SHOW COLUMNS FROM lawyers LIKE 'verification_status'");
            if (rows.length === 0) {
                console.log('Column does not exist, adding it now...');
                await db.execute("ALTER TABLE lawyers ADD COLUMN verification_status ENUM('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED') DEFAULT 'VERIFIED'");
                console.log('✅ Added verification_status column successfully.');
            } else {
                console.log('✅ Column verification_status already exists.');
            }
        } catch (e) {
            console.error('Error modifying table:', e);
        }

        console.log('Done.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

fixSchema();
