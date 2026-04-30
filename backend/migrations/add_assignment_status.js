/**
 * Database Migration: Add assignment_status to cases table
 * 
 * Purpose: Enable strict separation between USER private cases and LAWYER professional cases
 * 
 * Rules:
 * - UNASSIGNED: User's private case tracking (no lawyer involved)
 * - REQUESTED: User sent case to lawyer for professional handling
 * - ACCEPTED: Lawyer accepted - NOW it appears in lawyer dashboard
 * - REJECTED: Lawyer declined the case
 */

const { createDatabasePool } = require('../config/database');

async function addAssignmentStatus() {
    // Initialize database connection first
    const db = await createDatabasePool();

    if (!db) {
        console.error('\n❌ Failed to connect to database. Cannot run migration.');
        console.error('   Please check your database configuration in .env file');
        process.exit(1);
    }

    try {
        console.log('\n🔧 DATABASE MIGRATION: Adding assignment_status column\n');

        // Step 1: Check if column already exists
        console.log('Step 1: Checking if assignment_status column exists...');
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'cases' 
            AND COLUMN_NAME = 'assignment_status'
        `);

        if (columns.length > 0) {
            console.log('✅ Column assignment_status already exists. Skipping creation.');
        } else {
            // Step 2: Add the column
            console.log('Step 2: Adding assignment_status column...');
            await db.query(`
                ALTER TABLE cases 
                ADD COLUMN assignment_status ENUM('UNASSIGNED', 'REQUESTED', 'ACCEPTED', 'REJECTED') 
                DEFAULT 'UNASSIGNED' 
                AFTER lawyer_id
            `);
            console.log('✅ Column assignment_status added successfully');
        }

        // Step 3: Set existing cases with lawyers to ACCEPTED (backward compatibility)
        console.log('\nStep 3: Updating existing cases with lawyers...');
        const [updateResult] = await db.query(`
            UPDATE cases 
            SET assignment_status = 'ACCEPTED' 
            WHERE lawyer_id IS NOT NULL 
            AND assignment_status = 'UNASSIGNED'
        `);
        console.log(`✅ Updated ${updateResult.affectedRows} existing cases to ACCEPTED status`);

        // Step 4: Add index for performance
        console.log('\nStep 4: Adding performance index...');
        try {
            await db.query(`
                CREATE INDEX idx_cases_lawyer_assignment 
                ON cases(lawyer_id, assignment_status)
            `);
            console.log('✅ Index created successfully');
        } catch (indexError) {
            if (indexError.code === 'ER_DUP_KEYNAME') {
                console.log('✅ Index already exists. Skipping.');
            } else {
                throw indexError;
            }
        }

        // Step 5: Verify migration
        console.log('\nStep 5: Verifying migration...');
        const [casesWithStatus] = await db.query(`
            SELECT 
                assignment_status,
                COUNT(*) as count
            FROM cases
            GROUP BY assignment_status
        `);

        console.log('\n📊 Cases by assignment_status:');
        casesWithStatus.forEach(row => {
            console.log(`   ${row.assignment_status}: ${row.count} cases`);
        });

        console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n');
        console.log('📝 Next Steps:');
        console.log('   1. Update backend models to use assignment_status');
        console.log('   2. Update controllers to filter by assignment_status');
        console.log('   3. Update frontend to handle different assignment statuses');
        console.log('   4. Test lawyer dashboard shows only ACCEPTED cases');
        console.log('   5. Test user case tracker shows all their cases\n');

    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error.message);
        console.error('Error Code:', error.code);
        console.error('SQL State:', error.sqlState);
        throw error;
    }
}

// Run migration
addAssignmentStatus()
    .then(() => {
        console.log('Migration script finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
