const { createDatabasePool, getDatabase } = require('../config/database');
const dotenv = require('dotenv');
const path = require('path');

// Ensure Environment Variables are loaded (since we are running from backend/scripts/ we might need to point to root backend .env)
dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanup() {
    try {
        console.log("Initializing database connection...");
        const db = await createDatabasePool();

        if (!db) {
            console.error("Failed to connect to database.");
            process.exit(1);
        }

        console.log("Cleaning up all case-related data...");

        // Delete from child tables first to avoid Foreign Key constraint errors
        console.log("- Deleting case intelligence...");
        await db.query("DELETE FROM case_intelligence");

        console.log("- Deleting case hearings...");
        await db.query("DELETE FROM case_hearings");

        console.log("- Deleting case updates...");
        await db.query("DELETE FROM case_updates");

        console.log("- Deleting case documents...");
        await db.query("DELETE FROM case_documents");

        // Finally delete the cases
        console.log("- Deleting cases...");
        await db.query("DELETE FROM cases");

        console.log("✅ All cases and related data have been permanently deleted.");
        process.exit(0);

    } catch (error) {
        console.error("Error during cleanup:", error);
        process.exit(1);
    }
}

cleanup();
