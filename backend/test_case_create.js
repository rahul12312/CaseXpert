const { createDatabasePool, getDatabase } = require('./config/database');
const Case = require('./models/Case');

async function testCreate() {
    const pool = await createDatabasePool();

    try {
        // Get a user
        const [users] = await pool.query("SELECT id FROM users LIMIT 1");
        if (users.length === 0) {
            console.log("No users found to test with.");
            process.exit(1);
        }
        const userId = users[0].id;
        console.log("Testing with User ID:", userId);

        const caseData = {
            user_id: userId,
            title: "Test Case DB Debug",
            description: "Debugging creation failure",
            case_number: "TEST-" + Date.now(),
            case_type: "family",
            priority: "high",
            court_name: "Test Court",
            filing_date: new Date(),
            opponent_name: "Opponent",
            opponent_lawyer: "Opp Lawyer"
        };

        console.log("Attempting to create case...");
        const id = await Case.create(caseData, "Test User");
        console.log("✅ Case created successfully! ID:", id);

    } catch (error) {
        console.error("❌ Failed to create case:");
        console.error(error);
    } finally {
        process.exit(0);
    }
}

testCreate();
