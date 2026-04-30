const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit process here strictly, but you might want to depending on app needs
    return null;
  }
};

module.exports = connectMongoDB;
