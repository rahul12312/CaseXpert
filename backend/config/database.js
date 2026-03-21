const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

let db = null;

const createDatabasePool = async () => {
  if (db) {
    return db;
  }

  try {
    db = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Ajsql123",
      database: process.env.DB_NAME || "casexpert_db",
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      waitForConnections: true,
      queueLimit: 0
    });

    // Test connection
    const connection = await db.getConnection();
    console.log("✅ MySQL Database connected successfully!");
    console.log(`   → Database: ${process.env.DB_NAME}`);
    console.log(`   → Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    connection.release();

    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("   Please check your MySQL server and credentials.");
    return null;
  }
};

const getDatabase = () => {
  if (!db) {
    console.error("⚠️  getDatabase() called but DB pool is NULL!");
  }
  return db;
};

module.exports = {
  createDatabasePool,
  getDatabase
};
