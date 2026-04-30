const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN_CREDENTIALS = {
    name: 'System Admin',
    email: 'admin@casexpert.com',
    password: 'AdminPassword123',
    user_type: 'admin',
    is_active: true,
    is_verified: true
};

async function createAdmin() {
    try {
        console.log('🔵 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // Check if user already exists
        const existingUser = await User.findOne({ email: ADMIN_CREDENTIALS.email });
        if (existingUser) {
            console.log('⚠️ Admin user already exists. Updating password and type...');
            existingUser.password = ADMIN_CREDENTIALS.password; // Schema hook will hash it
            existingUser.user_type = 'admin';
            existingUser.is_active = true;
            existingUser.is_verified = true;
            await existingUser.save();
            console.log('✅ Admin user updated successfully.');
        } else {
            console.log('📝 Creating new admin user...');
            const newAdmin = new User(ADMIN_CREDENTIALS);
            await newAdmin.save();
            console.log('✅ Admin user created successfully.');
        }

        console.log('\n================================');
        console.log('🎉 ADMIN LOGIN CREDENTIALS');
        console.log('================================');
        console.log('Email:    ', ADMIN_CREDENTIALS.email);
        console.log('Password: ', ADMIN_CREDENTIALS.password);
        console.log('================================\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
        process.exit();
    }
}

createAdmin();
