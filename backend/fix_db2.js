const mysql = require('mysql2/promise');
async function run() {
    const c = await mysql.createConnection({
        host: '127.0.0.1', 
        user: 'root', 
        password: 'Ajsql123', 
        database: 'casexpert_db'
    });
    
    await c.query("ALTER TABLE case_documents MODIFY COLUMN uploaded_by_role ENUM('user','lawyer','admin','system','client') NOT NULL DEFAULT 'user'");
    await c.query("ALTER TABLE case_updates MODIFY COLUMN created_by_role ENUM('user','lawyer','admin','system','client') NOT NULL DEFAULT 'user'");
    console.log("Other enums updated");
    
    await c.end();
}
run();
