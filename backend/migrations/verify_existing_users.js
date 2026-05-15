/**
 * verify_existing_users.js
 * 
 * One-time migration: marks all existing (pre-OTP) users as verified
 * so they are not locked out after the OTP feature goes live.
 * 
 * Run once: node backend/migrations/verify_existing_users.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

async function run() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected\n");

    const db = mongoose.connection.db;
    const result = await db.collection("users").updateMany(
      { is_verified: { $ne: true } },
      { $set: { is_verified: true } }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   Modified: ${result.modifiedCount} users`);
    console.log(`   Matched:  ${result.matchedCount} users`);
    console.log("\nAll existing users are now verified. New registrations will require OTP.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
    process.exit(0);
  }
}

run();
