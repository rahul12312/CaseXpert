const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setupAiChat() {
    try {
        console.log("Connecting to MySQL...");
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'casexpert_db',
            multipleStatements: true
        });

        const sqlPath = path.join(__dirname, '../database/ai_chat_schema.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        const delimiterBlocks = [];
        let modifiedSql = sql;

        let parsing = true;
        while (parsing) {
            const startIdx = modifiedSql.indexOf('DELIMITER //');
            if (startIdx === -1) {
                parsing = false;
                break;
            }
            const endIdx = modifiedSql.indexOf('DELIMITER ;', startIdx);
            if (endIdx === -1) {
                parsing = false;
                break;
            }
            
            const block = modifiedSql.substring(startIdx + 'DELIMITER //'.length, endIdx);
            const triggers = block.split('//').map(s => s.trim()).filter(s => s.length > 0);
            delimiterBlocks.push(...triggers);
            
            modifiedSql = modifiedSql.substring(0, startIdx) + modifiedSql.substring(endIdx + 'DELIMITER ;'.length);
        }

        console.log("Executing standard queries...");
        await connection.query(modifiedSql);

        console.log("Executing triggers and procedures...");
        for (const query of delimiterBlocks) {
            if (query.length > 0) {
                await connection.query(query);
            }
        }

        console.log("AI chat tables successfully created!");
        await connection.end();
    } catch (e) {
        console.error("Error setting up AI chat tables:", e.message);
    }
}

setupAiChat();
