const Booking = require("../models/Booking");
const Lawyer = require("../models/Lawyer");
const User = require("../models/User");
const { Groq } = require("groq-sdk");
const { PROMPTS } = require("../services/aiPrompts");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.getAIInsights = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.user_type || req.user.role;

  try {
    console.log(`🧠 Generating AI Insights for ${role} (ID: ${userId})`);

    let metrics = {};
    if (role === "admin") {
      metrics = await getAdminMetrics();
    } else if (role === "lawyer") {
      metrics = await getLawyerMetrics(userId);
    } else {
      metrics = await getUserMetrics(userId);
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PROMPTS.LEGAL_INSIGHTS },
        { role: "user", content: `Generate insights for the following data: ${JSON.stringify({ role, metrics })}` },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    let insights = [];
    try {
      const raw = JSON.parse(completion.choices[0].message.content);
      insights = raw.insights || raw;
      if (!Array.isArray(insights)) insights = [insights];
    } catch (e) {
      insights = [{ category: "health", severity: "info", content: "Platform is stable.", action: "Check back later." }];
    }

    return res.json({ success: true, role, insights, lastUpdated: new Date() });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to generate insights" });
  }
};

async function getUserMetrics(userId) {
  const bookings = await Booking.find({ user: userId }).select("status createdAt");
  return {
    totalBookings: bookings.length,
    bookingStatuses: bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {}),
  };
}

async function getLawyerMetrics(userId) {
  const lawyer = await Lawyer.findOne({ user: userId });
  if (!lawyer) return {};
  const bookings = await Booking.find({ lawyer: lawyer._id }).select("status duration createdAt");
  return {
    totalRequests: bookings.length,
    acceptanceRate: bookings.length > 0 ? (bookings.filter(b => b.status === "confirmed").length / bookings.length) * 100 : 0,
    avgDuration: bookings.reduce((s, b) => s + (b.duration || 0), 0) / (bookings.length || 1),
    caseLoad: bookings.length,
  };
}

async function getAdminMetrics() {
  const [totalUsers, totalLawyers, totalBookings] = await Promise.all([
    User.countDocuments(),
    Lawyer.countDocuments(),
    Booking.find().select("status"),
  ]);
  return {
    platformUsers: totalUsers,
    platformLawyers: totalLawyers,
    bookingSuccessRate: totalBookings.length > 0 ? (totalBookings.filter(b => b.status === "completed").length / totalBookings.length) * 100 : 0,
  };
}
