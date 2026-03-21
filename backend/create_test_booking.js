require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTestBooking() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'casexpert_db'
        });

        console.log('✅ Connected');

        // Note: Using IDs found in check_db.js
        // Client ID: 1 (ajaytipe@gmail.com)
        // Lawyer User ID: 5 (arjun.mehta@example.com)
        // Lawyer Record ID: 1 (Criminal Law)

        const bookingTime = new Date();
        const [res] = await connection.query(
            'INSERT INTO bookings (booking_number, user_id, lawyer_id, booking_type, booking_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['TEST-BK-001', 1, 1, 'video_call', bookingTime, 'confirmed', 'Test consultation request']
        );

        console.log('✅ Created Booking ID:', res.insertId);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestBooking();
