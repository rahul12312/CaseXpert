const { getDatabase, createDatabasePool } = require('../config/database');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const clientsData = [
    { name: 'Aman Kumar', email: 'aman@example.com', phone: '9876543210' },
    { name: 'Sonal Singh', email: 'sonal@example.com', phone: '9876543211' },
    { name: 'John Doe', email: 'john@example.com', phone: '9876543212' },
    { name: 'Priya Verma', email: 'priya@example.com', phone: '9876543213' },
    { name: 'Rahul Sharma', email: 'rahul@test.com', phone: '9876543214' }
];

async function seedClients() {
    await createDatabasePool();
    const db = getDatabase();
    console.log('🔵 Seeding client users...');

    for (const client of clientsData) {
        try {
            const userSql = `INSERT IGNORE INTO users (name, email, phone, password, user_type, is_verified, is_active) 
                             VALUES (?, ?, ?, ?, 'client', 1, 1)`;
            const userPass = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password123'
            
            await db.execute(userSql, [client.name, client.email, client.phone, userPass]);
            console.log(`✅ Seeded Client: ${client.name} (${client.email})`);
        } catch (err) {
            console.error(`❌ Failed to seed ${client.name}:`, err.message);
        }
    }

    console.log('✨ Client seeding complete.');
    process.exit();
}

seedClients();
