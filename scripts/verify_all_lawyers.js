const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Lawyer = require('../models/Lawyer');

async function verifyLawyers() {
    console.log('🚀 Starting Bulk Lawyer Verification...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // Update all lawyers to VERIFIED
        const result = await Lawyer.updateMany({}, { 
            $set: { 
                verification_status: 'VERIFIED',
                license_verified: true,
                availability_status: 'available'
            } 
        });
        
        console.log(`✨ Successfully verified ${result.modifiedCount} lawyers.`);
        console.log(`👉 All lawyers are now active and will appear in search results.`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit();
    }
}

verifyLawyers();
