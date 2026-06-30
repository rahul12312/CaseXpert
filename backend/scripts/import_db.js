const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
    try {
        console.log("Connecting to MySQL...");
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: 'root',
            multipleStatements: true
        });

        const schemaPath = path.join(__dirname, '..', 'database', 'casexpert_schema.sql');
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Extract DELIMITER blocks and remove them from the main script
        const delimiterBlocks = [];
        let modifiedSql = schemaSql;

        // A basic regex to extract delimiter blocks
        // Using a loop to find DELIMITER // ... // DELIMITER ;
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
            
            // split block by // and execute each
            const triggers = block.split('//').map(s => s.trim()).filter(s => s.length > 0);
            delimiterBlocks.push(...triggers);
            
            modifiedSql = modifiedSql.substring(0, startIdx) + modifiedSql.substring(endIdx + 'DELIMITER ;'.length);
        }

        console.log("Executing standard schema queries...");
        await connection.query(modifiedSql);
        console.log("Standard schema imported successfully.");

        console.log("Executing triggers and procedures...");
        for (const query of delimiterBlocks) {
            if (query.length > 0) {
                await connection.query(query);
            }
        }
        console.log("Triggers and Procedures imported successfully.");

        // Data seeding
        const dataPath = path.join(__dirname, '..', 'database', '30_lawyers_sample_data.sql');
        const dataSql = fs.readFileSync(dataPath, 'utf8');
        console.log("Executing 30_lawyers_sample_data.sql...");
        await connection.query(dataSql);
        console.log("Sample data imported successfully.");

        await connection.end();
        console.log("Database setup complete!");
    } catch (error) {
        console.error("Error setting up database:", error.message);
    }
}

importDatabase();
