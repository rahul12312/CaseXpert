const { getDatabase, createDatabasePool } = require('./config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
    await createDatabasePool();
    const db = getDatabase();
    console.log('🚀 Enhancing lawyers table schema...');

    try {
        const columnsToAdd = [
            { name: 'total_cases', type: 'INT DEFAULT 0' },
            { name: 'total_reviews', type: 'INT DEFAULT 0' },
            { name: 'success_rate', type: 'DECIMAL(5,2) DEFAULT 0.00' },
            { name: 'response_time', type: 'VARCHAR(50) DEFAULT "Within 24 hours"' },
            { name: 'is_available_today', type: 'TINYINT(1) DEFAULT 0' },
            { name: 'is_24_7_support', type: 'TINYINT(1) DEFAULT 0' }
        ];

        const [existingColumns] = await db.query('DESCRIBE lawyers');
        const existingNames = existingColumns.map(c => c.Field);

        for (const col of columnsToAdd) {
            if (!existingNames.includes(col.name)) {
                console.log(`Adding column: ${col.name}`);
                await db.query(`ALTER TABLE lawyers ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        console.log('✅ Schema enhancement complete.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    }
    process.exit();
}

migrate();

