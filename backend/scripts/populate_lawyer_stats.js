const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Lawyer = require("./models/Lawyer");

const MONGO_URI = process.env.MONGO_URI;

async function populateLawyerStats() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const lawyers = await Lawyer.find({});
    console.log(`Found ${lawyers.length} lawyers. Populating realistic stats...`);

    for (const lawyer of lawyers) {
      const experience = lawyer.experience || Math.floor(Math.random() * 20) + 3;

      // Generate realistic total_cases based on experience
      const totalCases = Math.floor(experience * (8 + Math.random() * 15));

      // Generate realistic rating (3.8 - 5.0)
      const rating = parseFloat((3.8 + Math.random() * 1.2).toFixed(1));

      // Generate some reviews if none exist
      if (lawyer.reviews.length === 0) {
        const numReviews = Math.floor(totalCases * (0.1 + Math.random() * 0.15));
        const reviewTexts = [
          "Excellent lawyer, very professional and thorough.",
          "Helped me win my case with great expertise.",
          "Very knowledgeable and responsive throughout.",
          "Great experience, highly recommended!",
          "Professional approach and good communication.",
          "Resolved my case efficiently. Thank you!",
          "Very attentive to details and deadlines.",
          "Outstanding legal advice and representation.",
          "Guided me through the entire process smoothly.",
          "Highly skilled advocate with deep legal knowledge.",
          "Fantastic support during a difficult time.",
          "Clear communication and strong courtroom presence.",
          "Went above and beyond to help me.",
          "Patient, understanding, and very effective.",
          "Would definitely recommend to anyone.",
        ];

        for (let i = 0; i < Math.min(numReviews, 15); i++) {
          lawyer.reviews.push({
            user: new mongoose.Types.ObjectId(),
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            review_text: reviewTexts[i % reviewTexts.length],
            is_published: true,
          });
        }
      }

      lawyer.total_cases = totalCases;
      lawyer.rating = rating;

      await lawyer.save();
      console.log(`✅ ${lawyer.specialization} lawyer (${experience}yr exp) → ${totalCases} cases, ${rating} rating, ${lawyer.reviews.length} reviews`);
    }

    console.log("\n🎉 All lawyers updated with realistic stats!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

populateLawyerStats();
