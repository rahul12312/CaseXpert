const { createDatabasePool } = require('../config/database');

async function resetCaseAssignments() {
    console.log('🔄 Connecting to database...');
    const db = await createDatabasePool();

    if (!db) {
        console.error('❌ Failed to connect to database');
        process.exit(1);
    }

    try {
        console.log('🧹 Resetting all case assignments...');

        // Update all cases to UNASSIGNED status
        // This removes them from Lawyer Dashboards (Requests & Accepted)
        // We do NOT clear lawyer_id to preserve history, but they become invisible to lawyers
        // due to the new strict 'assignment_status' filtering.
        const [result] = await db.query(`
            UPDATE cases 
            SET assignment_status = 'UNASSIGNED'
        `);

        console.log(`✅ database updated.`);
        console.log(`   Changed ${result.changedRows} cases to 'UNASSIGNED'.`);
        console.log('   Lawyer dashboards should now be empty of cases.');

    } catch (error) {
        console.error('❌ Error resetting cases:', error);
    } finally {
        process.exit(0);
    }
}

resetCaseAssignments();
