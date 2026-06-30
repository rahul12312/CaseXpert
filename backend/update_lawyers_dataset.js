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

    const fs = require('fs');
    const profilesDir = path.join(__dirname, '../frontend/public/uploads/profiles');
    const files = fs.readdirSync(profilesDir);
    
    const maleImages = files.filter(f => f.startsWith('m') && f.endsWith('.png')).map(f => `/uploads/profiles/${f}`);
    const femaleImages = files.filter(f => f.startsWith('f') && f.endsWith('.png')).map(f => `/uploads/profiles/${f}`);

    for (let user of users) {
      if (user.gender === "Female") {
        user.profile_image = femaleImages[Math.floor(Math.random() * femaleImages.length)] || '/default-lawyer.png';
      } else {
        user.profile_image = maleImages[Math.floor(Math.random() * maleImages.length)] || '/default-lawyer.png';
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
