const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

require("./models/User");
const Lawyer = require("./models/Lawyer");

async function checkLawyer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const lawyer = await Lawyer.findOne().populate("user");
    if (lawyer) {
      console.log("Lawyer Profile Found:");
      console.log("- User Email:", lawyer.user.email);
      console.log("- Specialization:", lawyer.specialization);
      console.log("- Status:", lawyer.verification_status);
    } else {
      console.log("❌ No Lawyer profile found!");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkLawyer();
