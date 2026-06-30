const { createDatabasePool } = require('./config/database');
(async () => {
    try {
        const db = await createDatabasePool();
        const [rows] = await db.query("SELECT l.*, u.name FROM lawyers l JOIN users u ON l.user_id = u.id WHERE u.name LIKE '%Aman%'");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
