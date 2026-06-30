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

    const maleImages = ['/uploads/profiles/m1.png', '/uploads/profiles/m2.png', '/uploads/profiles/m3.png'];
    const femaleImages = ['/uploads/profiles/f1.png', '/uploads/profiles/f2.png', '/uploads/profiles/f3.png'];

    for (let user of users) {
      if (user.gender === "Female") {
        user.profile_image = femaleImages[Math.floor(Math.random() * femaleImages.length)];
      } else {
        user.profile_image = maleImages[Math.floor(Math.random() * maleImages.length)];
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
