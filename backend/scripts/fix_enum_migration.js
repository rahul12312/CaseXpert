const { createDatabasePool } = require('./config/database');

async function fixEnum() {
    const pool = await createDatabasePool();
    try {
        console.log("Modifying status column...");
        // Combine all potential statuses
        await pool.query(`
        ALTER TABLE cases 
        MODIFY COLUMN status ENUM(
            'open', 
            'pending', 
            'assigned', 
            'in-progress', 'in_progress', 
            'hearing-scheduled', 
            'evidence-pending', 
            'under-review', 
            'on_hold', 
            'resolved', 
            'closed', 
            'archived'
        ) NOT NULL DEFAULT 'open'
      `);
        console.log("✅ Status column updated.");

        console.log("Modifying case_type column...");
        await pool.query(`
        ALTER TABLE cases 
        MODIFY COLUMN case_type ENUM(
            'civil', 'criminal', 'property', 'family', 'corporate', 'labor', 'consumer', 'tax', 'other'
        ) NOT NULL DEFAULT 'other'
      `);
        console.log("✅ Case Type column updated.");

    } catch (e) {
        console.error("Error updating schema:", e.message);
    }
    process.exit(0);
}

fixEnum();
