const mysql = require('mysql2/promise');
async function run() {
    const c = await mysql.createConnection({
        host: '127.0.0.1', 
        user: 'root', 
        password: 'Ajsql123', 
        database: 'casexpert_db'
    });
    
    // Add "client" to case_activities actor_role ENUM
    await c.query("ALTER TABLE case_activities MODIFY COLUMN actor_role ENUM('user','lawyer','admin','system','client') NOT NULL DEFAULT 'user'");
    console.log("case_activities actor_role updated");
    
    await c.end();
}
run();
