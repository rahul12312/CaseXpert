// Check actual cases table structure
const { createDatabasePool, getDatabase } = require('./config/database');

async function checkCasesTable() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log('📋 Checking CASES table structure...\n');

        // Get table structure
        const [columns] = await db.query('DESCRIBE cases');

        console.log('Columns in cases table:');
        console.table(columns.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Key: col.Key,
            Default: col.Default
        })));

        // Check which columns are NOT NULL (required)
        console.log('\n🔴 Required fields (NOT NULL):');
        columns.filter(col => col.Null === 'NO' && col.Field !== 'id').forEach(col => {
            console.log(`   - ${col.Field} (${col.Type})`);
        });

        // Check enum values for status
        const statusCol = columns.find(col => col.Field === 'status');
        if (statusCol) {
            console.log('\n📊 Status ENUM values:');
            console.log('   ', statusCol.Type);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCasesTable();
