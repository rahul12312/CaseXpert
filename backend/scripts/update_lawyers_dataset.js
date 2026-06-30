const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const connectMongoDB = require("../config/mongodb");

const updateLawyerPictures = async () => {
  try {
    await connectMongoDB();
    
    const users = await User.find({ user_type: "lawyer" });
    console.log(`Found ${users.length} lawyers to update pictures for.`);

    const fs = require('fs');
    const profilesDir = path.join(__dirname, '../../frontend/public/uploads/profiles');
    const files = fs.readdirSync(profilesDir);
    
    const maleImages = files.filter(f => f.startsWith('m') && f.endsWith('.png')).map(f => `/uploads/profiles/${f}`);
    const femaleImages = files.filter(f => f.startsWith('f') && f.endsWith('.png')).map(f => `/uploads/profiles/${f}`);

    // Shuffle arrays to randomize the sequence
    maleImages.sort(() => Math.random() - 0.5);
    femaleImages.sort(() => Math.random() - 0.5);

    let maleIndex = 0;
    let femaleIndex = 0;

    for (let user of users) {
      if (user.gender === "Female") {
        user.profile_image = femaleImages[femaleIndex % femaleImages.length] || '/default-lawyer.png';
        femaleIndex++;
      } else {
        user.profile_image = maleImages[maleIndex % maleImages.length] || '/default-lawyer.png';
        maleIndex++;
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
