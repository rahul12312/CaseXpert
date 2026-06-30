const mysql = require('mysql2/promise');
require('dotenv').config();

const debugLawyer = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'casexpert_db'
        });

        // Get Suresh Iyer's User ID
        const [users] = await connection.query("SELECT id, name, email FROM users WHERE email = 'suresh.iyer@example.com'");
        if (!users.length) {
            console.log('User not found');
            return;
        }
        const userId = users[0].id;
        console.log(`User ID: ${userId}`);

        // Get Lawyer Details
        const [lawyers] = await connection.query("SELECT * FROM lawyers WHERE user_id = ?", [userId]);
        if (!lawyers.length) {
            console.log('Lawyer entry not found');
            return;
        }
        const lawyer = lawyers[0];
        console.log('Lawyer Details:', lawyer);

        if (lawyer.verification_status !== 'VERIFIED') {
            console.log('⚠️ WARNING: Lawyer is NOT verified. This will prevent accepting bookings.');
        }

        // Check bookings for this lawyer
        const [bookings] = await connection.query("SELECT id, status FROM bookings WHERE lawyer_id = ?", [lawyer.id]);
        console.log('Bookings:', bookings);

    } catch (e) {
        console.error(e);
    } finally {
        if (connection) await connection.end();
    }
};

debugLawyer();
