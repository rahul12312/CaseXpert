/**
 * Create Admin User Script
 * 
 * This script creates an admin user in the database with predefined credentials
 * 
 * Admin Credentials:
 * Email: tipteajay@gmail.com
 * Password: demo12345
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const ADMIN_CREDENTIALS = {
    name: 'Admin',
    email: 'tipteajay@gmail.com',
    password: 'demo12345',
    user_type: 'admin'
};

async function createAdminUser() {
    let connection;

    try {
        console.log('🔵 Connecting to database...');

        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'casexpert'
        });

        console.log('✅ Database connected');

        // Check if admin already exists
        console.log('🔍 Checking for existing admin user...');
        const [existingUsers] = await connection.query(
            'SELECT id, name, email, user_type FROM users WHERE email = ?',
            [ADMIN_CREDENTIALS.email]
        );

        if (existingUsers.length > 0) {
            console.log('⚠️  Admin user already exists:');
            console.log('   ID:', existingUsers[0].id);
            console.log('   Name:', existingUsers[0].name);
            console.log('   Email:', existingUsers[0].email);
            console.log('   Type:', existingUsers[0].user_type);

            // Ask if we should update the password
            console.log('\n🔄 Updating admin password to: demo12345');

            const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

            await connection.query(
                'UPDATE users SET password = ?, user_type = ?, is_active = 1, is_verified = 1 WHERE email = ?',
                [hashedPassword, ADMIN_CREDENTIALS.user_type, ADMIN_CREDENTIALS.email]
            );

            console.log('✅ Admin user updated successfully!');
        } else {
            // Create new admin user
            console.log('📝 Creating new admin user...');

            const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

            const [result] = await connection.query(
                `INSERT INTO users (name, email, password, user_type, is_active, is_verified, created_at) 
         VALUES (?, ?, ?, ?, 1, 1, NOW())`,
                [
                    ADMIN_CREDENTIALS.name,
                    ADMIN_CREDENTIALS.email,
                    hashedPassword,
                    ADMIN_CREDENTIALS.user_type
                ]
            );

            console.log('✅ Admin user created successfully!');
            console.log('   ID:', result.insertId);
        }

        // Display credentials
        console.log('\n================================');
        console.log('🎉 ADMIN LOGIN CREDENTIALS');
        console.log('================================');
        console.log('Email:    ', ADMIN_CREDENTIALS.email);
        console.log('Password: ', ADMIN_CREDENTIALS.password);
        console.log('================================\n');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
createAdminUser();
