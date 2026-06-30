
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");
const Lawyer = require("./models/Lawyer");

const MONGO_URI = process.env.MONGO_URI;

// Realistic Indian data arrays
const indianCities = [
  { city: "Mumbai", state: "Maharashtra", pin: "400001" },
  { city: "Delhi", state: "Delhi", pin: "110001" },
  { city: "Bangalore", state: "Karnataka", pin: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pin: "600001" },
  { city: "Kolkata", state: "West Bengal", pin: "700001" },
  { city: "Hyderabad", state: "Telangana", pin: "500001" },
  { city: "Pune", state: "Maharashtra", pin: "411001" },
  { city: "Ahmedabad", state: "Gujarat", pin: "380001" },
  { city: "Jaipur", state: "Rajasthan", pin: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", pin: "226001" },
  { city: "Chandigarh", state: "Punjab", pin: "160001" },
  { city: "Bhopal", state: "Madhya Pradesh", pin: "462001" },
  { city: "Patna", state: "Bihar", pin: "800001" },
  { city: "Kochi", state: "Kerala", pin: "682001" },
  { city: "Indore", state: "Madhya Pradesh", pin: "452001" },
  { city: "Nagpur", state: "Maharashtra", pin: "440001" },
  { city: "Guwahati", state: "Assam", pin: "781001" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", pin: "530001" },
  { city: "Thiruvananthapuram", state: "Kerala", pin: "695001" },
  { city: "Coimbatore", state: "Tamil Nadu", pin: "641001" },
];

const streetAddresses = [
  "12, MG Road", "45, Gandhi Nagar", "78, Nehru Street", "23, Civil Lines",
  "56, Sarojini Devi Road", "89, Rajendra Place", "34, Connaught Place",
  "67, Park Street", "11, Brigade Road", "90, Anna Salai",
  "15, Residency Road", "42, Banjara Hills", "38, Salt Lake Sector V",
  "71, FC Road", "28, Law Garden", "63, MI Road", "19, Hazratganj",
  "54, Sector 17", "82, New Market Road", "47, Marine Drive",
];

const barCouncilStates = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "West Bengal",
  "Telangana", "Gujarat", "Rajasthan", "Uttar Pradesh", "Punjab",
  "Madhya Pradesh", "Bihar", "Kerala", "Andhra Pradesh", "Assam",
];

const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB+"];

function generateAadhaar() {
  let n = "";
  for (let i = 0; i < 12; i++) n += Math.floor(Math.random() * 10);
  return n.replace(/(.{4})/g, "$1 ").trim();
}

function generatePAN() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let pan = "";
  for (let i = 0; i < 5; i++) pan += chars[Math.floor(Math.random() * 26)];
  for (let i = 0; i < 4; i++) pan += Math.floor(Math.random() * 10);
  pan += chars[Math.floor(Math.random() * 26)];
  return pan;
}

function generateBarCouncilId(state) {
  const stateCode = state.substring(0, 2).toUpperCase();
  const num = String(Math.floor(Math.random() * 90000) + 10000);
  const year = 2000 + Math.floor(Math.random() * 23);
  return `${stateCode}/${num}/${year}`;
}

function generatePhone() {
  const prefixes = ["98", "99", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85"];
  return prefixes[Math.floor(Math.random() * prefixes.length)] + String(Math.floor(Math.random() * 90000000) + 10000000);
}

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function populateLawyerProfiles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const lawyers = await Lawyer.find({}).populate("user");
    console.log(`Found ${lawyers.length} lawyers. Populating profile data...\n`);

    for (let i = 0; i < lawyers.length; i++) {
      const lawyer = lawyers[i];
      if (!lawyer.user) {
        console.log(`⚠️ Skipping lawyer ${lawyer._id} — no linked user`);
        continue;
      }

      const user = await User.findById(lawyer.user._id || lawyer.user);
      if (!user) {
        console.log(`⚠️ Skipping — user not found for lawyer ${lawyer._id}`);
        continue;
      }

      const experience = lawyer.experience || 5;
      const cityData = indianCities[i % indianCities.length];
      const barState = lawyer.bar_council_state || barCouncilStates[i % barCouncilStates.length];
      const enrollmentYear = new Date().getFullYear() - experience;
      const gender = lawyer.gender || (i % 4 === 0 ? "Female" : "Male");
      const dobYear = new Date().getFullYear() - experience - 23 - Math.floor(Math.random() * 5);

      // Update User document
      user.dob = randomDate(dobYear, dobYear);
      user.gender = gender;
      user.occupation = "Advocate";
      user.nationality = "Indian";
      user.marital_status = Math.random() > 0.35 ? "Married" : "Single";
      user.blood_group = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
      user.alternate_phone = generatePhone();
      user.emergency_contact = generatePhone();
      user.preferred_communication = ["Phone", "Email", "WhatsApp"][Math.floor(Math.random() * 3)];
      user.address = {
        street: streetAddresses[i % streetAddresses.length],
        city: cityData.city,
        state: cityData.state,
        country: "India",
        pin_code: cityData.pin,
      };
      user.identity = {
        aadhaar: generateAadhaar(),
        pan: generatePAN(),
        passport: Math.random() > 0.6 ? `J${Math.floor(Math.random() * 9000000) + 1000000}` : null,
        driving_license: Math.random() > 0.4 ? `${barState.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 9000000000) + 1000000000}` : null,
      };

      if (!user.phone) {
        user.phone = generatePhone();
      }

      await user.save();

      // Update Lawyer document  
      lawyer.bar_council_id = lawyer.bar_council_id || generateBarCouncilId(barState);
      lawyer.bar_council_state = barState;
      lawyer.enrollment_year = lawyer.enrollment_year || enrollmentYear;
      lawyer.gender = gender;
      lawyer.city = lawyer.city || cityData.city;
      lawyer.state = lawyer.state || cityData.state;

      await lawyer.save();

      console.log(`✅ ${user.name} — ${cityData.city}, ${cityData.state} | ${lawyer.specialization} | ${experience}yr | Bar: ${lawyer.bar_council_id}`);
    }

    console.log("\n🎉 All lawyer profiles populated with realistic data!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

populateLawyerProfiles();
