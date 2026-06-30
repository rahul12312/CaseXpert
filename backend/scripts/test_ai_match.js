const { recommendLawyersByAI } = require('./services/lawyerRecommendationService');
const { createDatabasePool } = require('./config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        await createDatabasePool();
        const problem = "I need a senior lawyer for a complex divorce and child custody case in Mumbai.";
        console.log(`🔍 Testing AI Match with problem: "${problem}"`);
        
        const result = await recommendLawyersByAI(problem);
        
        console.log("\n✅ AI Analysis:");
        console.log(JSON.stringify(result.analysis, null, 2));
        
        console.log("\n✅ Suggested Lawyers:");
        result.suggestedLawyers.forEach((l, i) => {
            console.log(`${i+1}. ${l.name} - ${l.specialization} (${l.city}) - Fee: ${l.consultation_fee}`);
        });

    } catch (err) {
        console.error("❌ Test Failed:", err);
    }
    process.exit();
}

test();
