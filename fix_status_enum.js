const { createDatabasePool, getDatabase } = require('./config/database');

async function fixStatusEnum() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log("Updating 'status' column ENUM in 'cases' table...");

        const query = `
            ALTER TABLE cases 
            MODIFY COLUMN status 
            ENUM('open', 'pending', 'in-progress', 'hearing-scheduled', 'resolved', 'closed', 'archived') 
            DEFAULT 'open'
        `;

        await db.query(query);
        console.log("✅ Successfully updated 'status' ENUM to include 'pending' and 'hearing-scheduled'.");

        process.exit(0);
    } catch (e) {
        console.error("Error updating ENUM:", e);
        process.exit(1);
    }
}

fixStatusEnum();
