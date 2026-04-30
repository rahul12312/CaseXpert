const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const users = await User.find({}).limit(10);
        console.log(`\n📊 Total Users in DB: ${await User.countDocuments()}`);
        console.log('\n--- Sample Users ---');
        users.forEach(u => {
            console.log(`- [${u.user_type}] ${u.name} (${u.email}) | ID: ${u._id}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

listUsers();
