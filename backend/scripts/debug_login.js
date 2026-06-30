const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' }); // Load env from root or current dir

async function checkUser() {
    try {
        console.log('Connecting to database...');
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'casexpert_db'
        });

        const email = 'suresh.iyer@example.com';
        console.log(`Searching for user: ${email}`);

        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log('❌ User NOT found in database.');
        } else {
            const user = rows[0];
            console.log('✅ User found:');
            console.log(`  ID: ${user.id}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Role: ${user.user_type}`);
            console.log(`  Password Hash: ${user.password}`);
            console.log(`  Is Active: ${user.is_active}`); // Checking this field specifically

            // Test password
            const testPass = 'password123';
            console.log(`Testing password: "${testPass}"`);
            const isMatch = await bcrypt.compare(testPass, user.password);

            if (isMatch) {
                console.log('✅ Password Match! The issue is likely not the hash.');
            } else {
                console.log('❌ Password DOES NOT Match. The hash in DB is incompatible or for a different password.');

                // Generate a new hash for debugging
                const newHash = await bcrypt.hash(testPass, 10);
                console.log(`  Expected compatible hash for "${testPass}": ${newHash}`);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
