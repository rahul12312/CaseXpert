// Quick Case Creation Test - Run with: node quick_test.js

const { createDatabasePool, getDatabase } = require('./config/database');

async function quickTest() {
    try {
        await createDatabasePool();
        const db = getDatabase();

        console.log('\n🧪 QUICK CASE CREATION TEST\n');

        // 1. Check if we have users
        const [users] = await db.query("SELECT id, name, user_type, is_verified FROM users WHERE user_type IN ('user', 'client') AND is_verified = TRUE LIMIT 1");

        if (users.length === 0) {
            console.log('❌ No verified users found. Please create a user account first.');
            process.exit(1);
        }

        console.log('✅ Test user:', users[0].name);

        // 2. Check if we have verified lawyers (optional but recommended)
        const [lawyers] = await db.query(`
      SELECT l.id, u.name 
      FROM lawyers l 
      JOIN users u ON l.user_id = u.id 
      WHERE u.is_verified = TRUE AND u.is_active = TRUE
      LIMIT 1
    `);

        if (lawyers.length > 0) {
            console.log('✅ Test lawyer:', lawyers[0].name);
        } else {
            console.log('⚠️  No verified lawyers found (optional for testing)');
        }

        // 3. Test case creation via model
        console.log('\n📋 Creating test case...');
        const Case = require('./models/Case');

        const caseData = {
            user_id: users[0].id,
            lawyer_id: lawyers.length > 0 ? lawyers[0].id : null,
            title: `Test Case - ${new Date().toLocaleString()}`,
            description: 'Automated test case for debugging',
            case_number: `AUTO-TEST-${Date.now()}`,
            case_type: 'civil',
            priority: 'medium',
            court_name: 'Test Court',
            filing_date: new Date().toISOString().split('T')[0],
            opponent_name: 'Test Opponent',
            opponent_lawyer: 'Test Opponent Lawyer'
        };

        const caseId = await Case.create(caseData, users[0].name);
        console.log('✅ Case created! ID:', caseId);

        // 4. Verify in database
        const [createdCase] = await db.query('SELECT * FROM cases WHERE id = ?', [caseId]);

        if (createdCase.length > 0) {
            console.log('\n📊 Verified in database:');
            console.log('   Title:', createdCase[0].title);
            console.log('   Case Number:', createdCase[0].case_number);
            console.log('   Status:', createdCase[0].status);
            console.log('   User ID:', createdCase[0].user_id);
            console.log('   Lawyer ID:', createdCase[0].lawyer_id || 'None');

            console.log('\n🎉 SUCCESS! Case creation is working perfectly!\n');
            console.log('✨ You can now create cases from the frontend.\n');
        } else {
            console.log('\n❌ ERROR: Case was not saved to database');
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('Error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check if MySQL server is running');
        console.error('2. Verify database credentials in .env file');
        console.error('3. Ensure all required tables exist');
        console.error('4. Run: node verify_case_schema.js');
        process.exit(1);
    }
}

quickTest();
