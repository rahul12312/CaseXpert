const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const runFix = async () => {
    let connection;
    try {
        console.log('🔵 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'casexpert_db'
        });

        console.log('✅ Connected.');

        // Generate correct hash for 'password123'
        const correctPassword = 'password123';
        const correctHash = await bcrypt.hash(correctPassword, 10);
        console.log(`🔐 Generated valid hash for '${correctPassword}': ${correctHash}`);

        // Update all users who have the old PHP-style hash (starting with $2y$)
        // or just update ALL users with user_type='lawyer' to be safe for testing
        console.log('🚀 Updating passwords for sample lawyers...');

        const [result] = await connection.query(
            "UPDATE users SET password = ? WHERE password LIKE '$2y$%' OR email = 'suresh.iyer@example.com'",
            [correctHash]
        );

        console.log(`✨ Success! Updated passwords for ${result.affectedRows} users.`);
        console.log(`👉 You can now login as 'suresh.iyer@example.com' with password 'password123'`);

    } catch (error) {
        console.error('❌ Error executing fix script:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('👋 Connection closed.');
        }
    }
};

runFix();
