const { createDatabasePool, getDatabase } = require('./config/database');

async function addMissingFields() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log("Checking for missing columns in 'cases' table...");

        const columnsToAdd = {
            'assignment_status': "ENUM('UNASSIGNED', 'REQUESTED', 'ACCEPTED', 'REJECTED') DEFAULT 'UNASSIGNED'",
            'next_hearing_date': "DATETIME NULL",
            'court_name': "VARCHAR(200) NULL",
            'filing_date': "DATE NULL",
            'opponent_name': "VARCHAR(200) NULL",
            'opponent_lawyer': "VARCHAR(200) NULL",
            'is_archived': "BOOLEAN DEFAULT FALSE",
        };

        const [columns] = await db.query('DESCRIBE cases');
        const existingColumns = columns.map(col => col.Field);

        for (const [colName, colDef] of Object.entries(columnsToAdd)) {
            if (!existingColumns.includes(colName)) {
                console.log(`Adding missing column: ${colName}`);
                await db.query(`ALTER TABLE cases ADD COLUMN ${colName} ${colDef};`);
                console.log(`✅ Successfully added ${colName}`);
            } else {
                console.log(`✅ Column ${colName} already exists.`);
            }
        }

        console.log("All missing columns handled.");
        process.exit(0);
    } catch (e) {
        console.error("Error adding missing fields:", e);
        process.exit(1);
    }
}

addMissingFields();
