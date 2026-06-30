const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' }); 

const User = require('../models/User'); 

async function seedAdmin() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/casexpert_db";
    console.log(`Connecting to MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    
    console.log("Connected to MongoDB.");

    const email = 'admin@casexpert.com';
    const plainPassword = 'AdminPassword123';
    
    let admin = await User.findOne({ email });
    
    if (admin) {
      console.log('Admin user found. Updating password and role...');
      // Mongoose pre-save hook will hash this plain text password automatically
      admin.password = plainPassword;
      admin.user_type = 'admin';
      admin.is_verified = true;
      await admin.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Admin user not found. Creating new admin user...');
      admin = new User({
        name: 'Super Admin',
        email: email,
        password: plainPassword,
        phone: '1234567890',
        user_type: 'admin',
        is_verified: true
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }
    
    console.log('Credentials:');
    console.log('Email:', email);
    console.log('Password:', plainPassword);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
