const { getAllLawyers } = require('./controllers/lawyerMarketplaceController');
const { createDatabasePool } = require('./config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    await createDatabasePool();
    const req = { query: { verified_only: 'true' } };
    const res = {
        json: (data) => console.log('✅ Success:', JSON.stringify(data, null, 2)),
        status: (code) => {
            console.log('❌ Status:', code);
            return { json: (data) => console.log('❌ Error Data:', JSON.stringify(data, null, 2)) };
        }
    };

    try {
        await getAllLawyers(req, res);
    } catch (err) {
        console.error('🔥 Caught Error:', err);
    }
    process.exit();
}

test();
