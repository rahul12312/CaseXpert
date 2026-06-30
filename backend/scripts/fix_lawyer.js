require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createLawyer() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'casexpert_db'
        });

        const email = 'arjun.mehta@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Inserting user...');
        await connection.query('DELETE FROM users WHERE email = ?', [email]);
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, phone, password, user_type, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
            ['Adv. Arjun Mehta', email, '9810012345', hashedPassword, 'lawyer', 1]
        );

        const userId = userResult.insertId;

        console.log('Inserting lawyer profile...');
        await connection.query(
            'INSERT INTO lawyers (user_id, specialization, experience, languages, rating, consultation_fee, bio, city, state, availability_status, total_cases_handled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, 'Criminal Law', 12, JSON.stringify(['English', 'Hindi', 'Marathi']), 4.8, 2500.00, 'Senior criminal defense attorney with over a decade of experience.', 'Mumbai', 'Maharashtra', 'available', 145]
        );

        console.log('✅ SUCCESS: Lawyer account created!');
        console.log('Email:', email);
        console.log('Password:', password);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating lawyer:', error.message);
        process.exit(1);
    }
}

createLawyer();
