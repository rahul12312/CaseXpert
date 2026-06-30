const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Lawyer = require("./models/Lawyer");
const connectMongoDB = require("./config/mongodb");

const updateLawyers = async () => {
  try {
    await connectMongoDB();
    
    // Find all users who are lawyers
    const users = await User.find({ 
      user_type: "lawyer" 
    });

    console.log(`Found ${users.length} lawyers to update.`);

    let maleCount = 1;
    let femaleCount = 1;

    for (let user of users) {
      // Replace @example.com with @gmail.com
      let newEmail = user.email.replace("@example.com", "@gmail.com");
      
      // Check if new email already exists in DB
      let existingUser = await User.findOne({ email: newEmail });
      let counter = 1;
      let originalBase = user.email.split('@')[0];
      while (existingUser && existingUser._id.toString() !== user._id.toString()) {
        newEmail = `${originalBase}${counter}@gmail.com`;
        existingUser = await User.findOne({ email: newEmail });
        counter++;
      }
      
      user.email = newEmail;
      
      // Assign profile picture based on gender
      if (!user.profile_image || user.profile_image.includes("example")) {
        if (user.gender === "Female") {
          user.profile_image = `https://randomuser.me/api/portraits/women/${femaleCount}.jpg`;
          femaleCount++;
        } else {
          user.profile_image = `https://randomuser.me/api/portraits/men/${maleCount}.jpg`;
          maleCount++;
        }
      }

      await user.save();
      console.log(`Updated User: ${user.name} -> Email: ${user.email}, Image: ${user.profile_image}`);
    }

    console.log("Update complete!");
    process.exit(0);
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
};

updateLawyers();
