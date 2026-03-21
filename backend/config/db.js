const mysql = require("mysql2");
require("dotenv").config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "casexpert_db",
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    if (err.code === "ECONNREFUSED") {
      console.error("   → MySQL server is not running");
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("   → Invalid username or password");
    } else if (err.code === "ER_BAD_DB_ERROR") {
      console.error("   → Database does not exist");
    }
    process.exit(1);
  }
  
  if (connection) {
    console.log("✅ MySQL Database connected successfully!");
    console.log(`   → Database: ${process.env.DB_NAME}`);
    console.log(`   → Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();
  }
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("   → Database connection was closed");
  }
  if (err.code === "ER_CON_COUNT_ERROR") {
    console.error("   → Database has too many connections");
  }
  if (err.code === "ECONNREFUSED") {
    console.error("   → Database connection was refused");
  }
});

// Export pool with promise wrapper for async/await
module.exports = pool.promise();
