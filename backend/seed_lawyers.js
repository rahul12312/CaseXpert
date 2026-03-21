const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const runSeed = async () => {
    let connection;
    try {
        console.log('🔵 Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'casexpert_db',
            multipleStatements: true // Critical for running the batch script with transactions
        });

        console.log('✅ Connected.');

        const sqlPath = path.join(__dirname, '../database/30_lawyers_sample_data.sql');
        console.log(`📖 Reading SQL file from: ${sqlPath}`);

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL script...');
        await connection.query(sql);

        console.log('✨ Success! 30 lawyers have been added to the database.');

    } catch (error) {
        console.error('❌ Error executing seed script:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('👋 Connection closed.');
        }
    }
};

runSeed();
