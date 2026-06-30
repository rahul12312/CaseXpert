const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const User = require("./models/User");

async function checkUserDetail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!");

    const user = await User.findOne({ email: "shreyash@gmail.com" });
    if (!user) {
      console.log("❌ User shreyash@gmail.com not found!");
    } else {
      console.log("User found:");
      console.log("- Name:", user.name);
      console.log("- Email:", user.email);
      console.log("- Active:", user.is_active);
      console.log("- Hash:", user.password);
      console.log("- Created:", user.createdAt);
    }

    const user2 = await User.findOne({ email: "shreyasht@gmail.com" });
    if (user2) {
      console.log("\nUser 2 found:");
      console.log("- Name:", user2.name);
      console.log("- Email:", user2.email);
      console.log("- Active:", user2.is_active);
      console.log("- Hash:", user2.password);
      console.log("- Created:", user2.createdAt);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkUserDetail();
