const { askAiLegalAssistant } = require("./aiLegalAssistantGroq");
const Lawyer = require("../models/Lawyer");

/**
 * Recommends lawyers based on user problem description using Mongoose
 */
exports.recommendLawyersByAI = async (problemDescription) => {
  try {
    const messages = [{ role: "user", content: `My legal issue is: ${problemDescription}` }];
    const { reply } = await askAiLegalAssistant(messages, "RECOMMENDATION");

    let aiAnalysis;
    try {
      const jsonStr = reply.replace(/```json|```/g, "").trim();
      aiAnalysis = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("AI could not categorize the issue properly.");
    }

    const { specialization, keywords, city, experience_level } = aiAnalysis;

    // Build Mongoose Query
    const query = {
      license_verified: true,
      $or: [
        { specialization: new RegExp(specialization, "i") },
        { bio: new RegExp(specialization, "i") },
        ...keywords.map((kw) => ({ bio: new RegExp(kw, "i") })),
        ...keywords.map((kw) => ({ specialization: new RegExp(kw, "i") })),
      ],
    };

    let lawyers = await Lawyer.find(query).populate("user").limit(10);

    // Manual sorting for "boost" (MongoDB aggregation could do this but for 10 results manual is fine)
    lawyers = lawyers
      .map((l) => {
        let score = 0;
        if (city && l.city && l.city.toLowerCase().includes(city.toLowerCase())) score += 50;
        if (l.specialization && l.specialization.toLowerCase().includes(specialization.toLowerCase())) score += 20;
        score += (l.rating || 0) * 5;
        score += (l.experience || 0) / 2;
        return { lawyer: l, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => {
        const l = item.lawyer;
        return {
          id: l._id,
          user_id: l.user ? l.user._id : null,
          name: l.user ? l.user.name : "Unknown",
          profile_image: l.user ? l.user.profile_image : null,
          specialization: l.specialization,
          experience: l.experience,
          consultation_fee: l.consultation_fee,
          bio: l.bio,
          city: l.city,
          average_rating: l.rating,
          total_cases: l.total_cases,
        };
      });

    if (lawyers.length === 0) {
      const fallbacks = await Lawyer.find({ license_verified: true }).populate("user").sort({ rating: -1 }).limit(3);
      return {
        analysis: { ...aiAnalysis, summary: "No exact match found. Showing top verified experts." },
        suggestedLawyers: fallbacks.map((l) => ({
          id: l._id,
          name: l.user ? l.user.name : "Unknown",
          specialization: l.specialization,
          rating: l.rating,
        })),
      };
    }

    return { analysis: aiAnalysis, suggestedLawyers: lawyers };
  } catch (error) {
    console.error("Lawyer Recommendation Service Error:", error);
    throw error;
  }
};
