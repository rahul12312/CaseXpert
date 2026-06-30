const { createDatabasePool, getDatabase } = require('./config/database');
const dotenv = require('dotenv');

dotenv.config();

async function checkTables() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log("Checking tables containing 'review'...");
        const [tables] = await db.query("SHOW TABLES LIKE '%review%'");
        console.log("Tables found:", tables);

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`\nSchema for ${tableName}:`);
            const [columns] = await db.query(`DESC ${tableName}`);
            console.log(columns.map(c => `${c.Field} (${c.Type})`).join(', '));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkTables();
