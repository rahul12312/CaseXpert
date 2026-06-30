const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const Booking = require('../models/Booking');
const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const ChatSession = require('../models/ChatSession');
const LegalUpdate = require('../models/LegalUpdate');
const LegalVideo = require('../models/LegalVideo');
const Document = require('../models/Document');

async function verify() {
    console.log('🔍 Final Migration Verification');
    console.log('-------------------------------');

    let mysqlConn;
    try {
        mysqlConn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        await mongoose.connect(process.env.MONGO_URI);

        const tables = [
            { sql: 'users', mongo: User, label: 'Users' },
            { sql: 'lawyers', mongo: Lawyer, label: 'Lawyers' },
            { sql: 'cases', mongo: Case, label: 'Cases' },
            { sql: 'bookings', mongo: Booking, label: 'Bookings' },
            { sql: 'case_hearings', mongo: Hearing, label: 'Hearings' },
            { sql: 'ai_chat_sessions', mongo: ChatSession, label: 'Chat Sessions' },
            { sql: 'legal_news', mongo: LegalUpdate, label: 'Legal News' },
            { sql: 'legal_videos', mongo: LegalVideo, label: 'Legal Videos' },
            { sql: 'documents', mongo: Document, label: 'Documents' }
        ];

        for (const t of tables) {
            try {
                const [sqlRows] = await mysqlConn.execute(`SELECT COUNT(*) as count FROM ${t.sql}`);
                const sqlCount = sqlRows[0].count;
                const mongoCount = await t.mongo.countDocuments();
                
                const status = sqlCount === mongoCount ? '✅ MATCH' : '❌ MISMATCH';
                console.log(`${t.label.padEnd(20)}: MySQL(${sqlCount}) vs Mongo(${mongoCount}) -> ${status}`);
            } catch (e) {
                console.log(`${t.label.padEnd(20)}: Table ${t.sql} might not exist in MySQL.`);
            }
        }

        // Special check for embedded data in Cases
        const cases = await Case.find().limit(5);
        console.log('\n📦 Content Check (Samples):');
        cases.forEach(c => {
            console.log(`- Case ${c.case_number}: ${c.timeline.length} timeline events, ${c.documents.length} docs embedded.`);
        });

    } catch (err) {
        console.error('Error during verification:', err);
    } finally {
        if (mysqlConn) await mysqlConn.end();
        mongoose.connection.close();
        process.exit(0);
    }
}

verify();
