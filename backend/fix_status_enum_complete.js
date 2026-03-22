const { createDatabasePool, getDatabase } = require('./config/database');

async function fixStatusEnum() {
    try {
        console.log('🔄 Starting full status ENUM update...');
        await createDatabasePool();
        const db = getDatabase();

        const statuses = [
            'pending', 
            'Under Review', 
            'hearing-scheduled', 
            'Hearing Scheduled', 
            'Resolved', 
            'Closed', 
            'in_progress', 
            'in-progress',
            'In Progress', 
            'Filed', 
            'assigned', 
            'on-hold', 
            'On Hold',
            'open'
        ];

        const enumStr = statuses.map(s => `'${s}'`).join(', ');
        
        console.log('🧹 Cleaning up invalid statuses...');
        await db.execute(`UPDATE cases SET status = 'pending' WHERE status IS NULL OR status = ''`);
        
        console.log('🧹 Converting to VARCHAR first to avoid truncation...');
        await db.execute(`ALTER TABLE cases MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'pending'`);
        
        console.log('🔍 Inspecting current values in VARCHAR column...');
        const [currentRows] = await db.query('SELECT DISTINCT status, HEX(status) as hex_val, LENGTH(status) as len FROM cases');
        currentRows.forEach(r => console.log(`   → Status: [${r.status}] (Length: ${r.len}, Hex: ${r.hex_val})`));

        const query = `ALTER TABLE cases MODIFY COLUMN status ENUM(${enumStr}) NOT NULL DEFAULT 'pending'`;
        
        console.log('📝 Applying new ENUM:', query);
        await db.execute(query);
        
        console.log('✅ Status ENUM updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update status ENUM:', error);
        process.exit(1);
    }
}

fixStatusEnum();
