const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const connectMongoDB = require("./config/mongodb");

const updateLawyerPictures = async () => {
  try {
    await connectMongoDB();
    
    const users = await User.find({ user_type: "lawyer" });
    console.log(`Found ${users.length} lawyers to update pictures for.`);

    let maleCount = 50; // start higher just to be safe and different
    let femaleCount = 50;

    for (let user of users) {
      if (user.gender === "Female") {
        user.profile_image = `https://randomuser.me/api/portraits/women/${femaleCount}.jpg`;
        femaleCount++;
      } else {
        user.profile_image = `https://randomuser.me/api/portraits/men/${maleCount}.jpg`;
        maleCount++;
      }

      await user.save();
      console.log(`Updated Picture for: ${user.name} -> ${user.profile_image}`);
    }

    console.log("Picture update complete!");
    process.exit(0);
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
};

updateLawyerPictures();
