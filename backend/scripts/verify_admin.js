const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verifyAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminUser = await User.findOne({ email: 'admin@casexpert.com' });
        
        if (adminUser) {
            console.log('✅ Admin User Found:');
            console.log('   ID:      ', adminUser._id);
            console.log('   Email:   ', adminUser.email);
            console.log('   Type:    ', adminUser.user_type);
            console.log('   Active:  ', adminUser.is_active);
            console.log('   Verified:', adminUser.is_verified);
        } else {
            console.log('❌ Admin User NOT Found.');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

verifyAdmin();
