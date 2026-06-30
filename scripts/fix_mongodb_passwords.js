const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function fixPasswords() {
    console.log('🚀 Starting Universal Password Reset for MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        console.log(`🔐 Generated valid hash for "${password}": ${hash}`);

        // Update all users
        // We use updateMany with the hashed value directly
        const result = await User.updateMany({}, { $set: { password: hash } });
        
        console.log(`✨ Successfully updated ${result.modifiedCount} users.`);
        console.log(`👉 All users can now login with password: "${password}"`);

        // Verify one user
        const testUser = await User.findOne({ email: 'arjun.mehta@gmail.com' });
        if (testUser) {
            const isMatch = await bcrypt.compare(password, testUser.password);
            console.log(`✅ Verification for ${testUser.email}: ${isMatch ? 'PASSED' : 'FAILED'}`);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit();
    }
}

fixPasswords();
