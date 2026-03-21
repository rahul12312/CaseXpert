const { createDatabasePool, getDatabase } = require('./config/database');
const dotenv = require('dotenv');

dotenv.config();

async function checkSchema() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log("Checking lawyer_reviews table schema...");
        const [columns] = await db.query("DESC lawyer_reviews");
        console.log(columns);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkSchema();
