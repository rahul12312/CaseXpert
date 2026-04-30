const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

async function diagnose() {
    console.log('🧪 Starting Database Diagnosis...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        const email = 'arjun.mehta@gmail.com';
        console.log(`\n🔍 Checking User: ${email}`);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found in MongoDB!');
            return;
        }

        console.log('User Data:');
        console.log(`- ID: ${user._id}`);
        console.log(`- Role (user_type): ${user.user_type}`);
        console.log(`- Is Active: ${user.is_active}`);
        console.log(`- Password Hash: ${user.password}`);

        // Test password comparison
        const testPassword = 'password123';
        console.log(`\n🎬 Testing password comparison for "${testPassword}"...`);
        
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`- Bcrypt Match Result: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

        if (!isMatch) {
            console.log('\n⚠️ Potential Issue Detected: Double Hashing or Incompatible Hash.');
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log(`- A freshly generated hash for "${testPassword}" would be: ${newHash}`);
            console.log(`- Notice if the lengths or patterns differ.`);
        }

        // Check Lawyer Profile link
        const lawyer = await Lawyer.findOne({ user: user._id });
        if (lawyer) {
            console.log('\n👨‍⚖️ Lawyer Profile found:');
            console.log(`- Lawyer ID: ${lawyer._id}`);
            console.log(`- Verification Status: ${lawyer.verification_status}`);
        } else {
            console.log('\n❌ No Lawyer Profile found linked to this user ID!');
        }

    } catch (err) {
        console.error('❌ Error during diagnosis:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected.');
        process.exit();
    }
}

diagnose();
