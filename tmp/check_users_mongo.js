const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });

const User = require("./backend/models/User");

async function checkUsers() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    const users = await User.find({}, "name email user_type createdAt");
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [${u.user_type}] Created: ${u.createdAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkUsers();
