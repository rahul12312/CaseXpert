const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

require("./models/User"); // Register User first
const Lawyer = require("./models/Lawyer");

async function findLawyer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const lawyer = await Lawyer.findOne().populate("user", "name");
    if (lawyer) {
      console.log("Found Lawyer:");
      console.log("- ID:", lawyer._id);
      console.log("- Name:", lawyer.user ? lawyer.user.name : "Unknown");
    } else {
      console.log("❌ No lawyers found!");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

findLawyer();
