require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSampleData() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'casexpert_db',
            multipleStatements: true
        });

        const dataPath = path.join(__dirname, '..', 'database', '30_lawyers_sample_data.sql');
        const dataSql = fs.readFileSync(dataPath, 'utf8');
        
        console.log('Executing 30_lawyers_sample_data.sql...');
        // Splitting by semicolon might be safer for large scripts but let's try multipleStatements first
        await connection.query(dataSql);
        
        console.log('✅ Sample data imported successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing sample data:', error.message);
        process.exit(1);
    }
}

importSampleData();
