const mysql = require('mysql2/promise');

async function testConnections() {
    const passwords = ['', 'root', 'password', 'Ajsql123', 'admin'];
    for (const pwd of passwords) {
        console.log(`Testing password: "${pwd}"`);
        try {
            const connection = await mysql.createConnection({
                host: '127.0.0.1',
                port: 3306,
                user: 'root',
                password: pwd,
            });
            console.log(`[SUCCESS] Connected to MySQL with password: "${pwd}"!`);
            await connection.end();
            return;
        } catch (error) {
            console.log(`[FAILED]: ${error.message}`);
        }
    }
    console.log("None of the passwords worked.");
}
testConnections();
