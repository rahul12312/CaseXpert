const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Lawyer = require("../models/Lawyer");
const connectMongoDB = require("../config/mongodb");

const femaleFirstNames = [
  "zara", "priya", "ananya", "sneha", "kavita", "meera", "fatima", 
  "divya", "pooja", "simran", "nishi", "grace", "sunita", "deepa", 
  "hina", "ishani", "neha", "aditi", "sakshi", "ritika", "ritu", "naina"
];

const fixGendersAndPictures = async () => {
  try {
    await connectMongoDB();
    
    const users = await User.find({ user_type: "lawyer" });
    console.log(`Found ${users.length} lawyer users to verify.`);

    // Read available images from the upload folder
    const profilesDir = path.join(__dirname, '../../frontend/public/uploads/profiles');
    if (!fs.existsSync(profilesDir)) {
      console.error("Profiles directory not found:", profilesDir);
      process.exit(1);
    }
    
    const files = fs.readdirSync(profilesDir);
    const maleImages = files.filter(f => f.startsWith('m') && f.endsWith('.png')).map(f => `/uploads/profiles/${f}`);
    const femaleImages = files.filter(f => f.startsWith('f') && f.endsWith('.png')).map(f => `/uploads/profiles/${f}`);

    console.log(`Loaded ${maleImages.length} male images and ${femaleImages.length} female images.`);

    // Shuffle arrays to randomize image assignment
    maleImages.sort(() => Math.random() - 0.5);
    femaleImages.sort(() => Math.random() - 0.5);

    let maleIndex = 0;
    let femaleIndex = 0;

    for (let user of users) {
      // Normalize name to check for female first name
      const cleanName = user.name.toLowerCase().replace("adv.", "").trim();
      const firstName = cleanName.split(" ")[0];

      // Exact match on first name
      const isFemale = femaleFirstNames.includes(firstName);
      const gender = isFemale ? "Female" : "Male";

      // Assign gender-matching profile image
      let profileImage;
      if (isFemale) {
        profileImage = femaleImages[femaleIndex % femaleImages.length] || '/default-lawyer.png';
        femaleIndex++;
      } else {
        profileImage = maleImages[maleIndex % maleImages.length] || '/default-lawyer.png';
        maleIndex++;
      }

      // Update User
      user.gender = gender;
      user.profile_image = profileImage;
      await user.save();

      // Update corresponding Lawyer profile if exists
      const lawyer = await Lawyer.findOne({ user: user._id });
      if (lawyer) {
        lawyer.gender = gender;
        await lawyer.save();
      }

      console.log(`👤 Name: ${user.name} | Detected Gender: ${gender} | Picture: ${profileImage}`);
    }

    console.log("\n🎉 Genders and profile pictures successfully matched and updated!");
    process.exit(0);
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
};

fixGendersAndPictures();
