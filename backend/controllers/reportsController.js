const Booking = require("../models/Booking");
const Lawyer = require("../models/Lawyer");
const User = require("../models/User");
const { askAiLegalAssistant } = require("../services/aiLegalAssistantGroq");

// ============================================================================
// GET DASHBOARD STATS (Now based on Bookings instead of Cases)
// ============================================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const { role, id } = req.user;
    const filter = {};

    if (role === "lawyer") {
      const lawyer = await Lawyer.findOne({ user: id });
      if (lawyer) filter.lawyer = lawyer._id;
    } else if (role === "user") {
      filter.user = id;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, closed, newThisMonth] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.countDocuments({ ...filter, status: { $in: ["pending", "confirmed"] } }),
      Booking.countDocuments({ ...filter, status: "completed" }),
      Booking.countDocuments({ ...filter, createdAt: { $gte: startOfMonth } }),
    ]);

    return res.json({
      success: true,
      data: {
        total_cases: total,
        active_cases: active,
        pending_hearings: 0,
        closed_cases: closed,
        new_cases_this_month: newThisMonth,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// GET CASE REPORTS (Booking aggregations)
// ============================================================================
exports.getCaseReports = async (req, res) => {
  try {
    const { role, id } = req.user;
    const match = {};
    if (role === "lawyer") {
      const lawyer = await Lawyer.findOne({ user: id });
      if (lawyer) match.lawyer = lawyer._id;
    } else if (role === "user") {
      match.user = id;
    }

    const byStatus = await Booking.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    const byType = await Booking.aggregate([
      { $match: match },
      { $group: { _id: "$booking_type", count: { $sum: 1 } } },
      { $project: { case_type: "$_id", count: 1, _id: 0 } },
    ]);

    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyCreated = await Booking.aggregate([
      { $match: { ...match, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ]);

    return res.json({
      success: true,
      data: { by_status: byStatus, by_type: byType, by_court: [], aging: [], monthly_created: monthlyCreated },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// GET RAW CASES (Bookings list)
// ============================================================================
exports.getRawCases = async (req, res) => {
  try {
    const { role, id } = req.user;
    const filter = {};
    if (role === "lawyer") {
      const lawyer = await Lawyer.findOne({ user: id });
      if (lawyer) filter.lawyer = lawyer._id;
    } else if (role === "user") {
      filter.user = id;
    }

    const bookings = await Booking.find(filter)
      .populate("user", "name")
      .populate({ path: "lawyer", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 })
      .limit(500);

    const rows = bookings.map((b) => ({
      id: b._id,
      title: `${b.booking_type} Consultation`,
      case_number: b.booking_number,
      status: b.status,
      priority: "normal",
      created_at: b.createdAt,
      total_updates: 0,
      total_documents: 0,
    }));

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// GET HEARING REPORTS (Placeholder - no hearings in MongoDB yet)
// ============================================================================
exports.getHearingReports = async (req, res) => {
  return res.json({ success: true, data: { upcoming: [], monthly_trend: [] } });
};

// ============================================================================
// GET ADVOCATE PERFORMANCE
// ============================================================================
exports.getAdvocatePerformance = async (req, res) => {
  try {
    const { role, id } = req.user;
    const match = role === "lawyer" ? { user: id } : {};

    const lawyers = await Lawyer.find(match).populate("user", "name");
    const performance = await Promise.all(
      lawyers.map(async (l) => {
        const [total, closed, active] = await Promise.all([
          Booking.countDocuments({ lawyer: l._id }),
          Booking.countDocuments({ lawyer: l._id, status: "completed" }),
          Booking.countDocuments({ lawyer: l._id, status: { $in: ["pending", "confirmed"] } }),
        ]);
        return {
          advocate_name: l.user?.name || "Unknown",
          lawyer_id: l._id,
          total_cases: total,
          closed_cases: closed,
          active_cases: active,
          rating: l.rating || 0,
        };
      })
    );

    return res.json({ success: true, data: performance });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// GET USER ACTIVITY
// ============================================================================
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .select("booking_type createdAt status")
      .sort({ createdAt: -1 })
      .limit(50);

    const activities = bookings.map((b) => ({
      activity_type: "booking_created",
      description: `${b.booking_type} Consultation (${b.status})`,
      timestamp: b.createdAt,
    }));

    return res.json({ success: true, data: activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// GET CASE INTELLIGENCE REPORT
// ============================================================================
exports.getCaseIntelligenceReport = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("user", "name")
      .populate({ path: "lawyer", populate: { path: "user", select: "name" } });

    if (!booking) return res.status(404).json({ success: false, message: "Case not found" });

    return res.json({
      success: false,
      message: "No report generated yet",
      data: { case_id: id, report: null, stats: { total_hearings: 0, total_documents: 0, adjournment_count: 0 } },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// GENERATE CASE INTELLIGENCE REPORT
// ============================================================================
exports.generateCaseIntelligenceReport = async (req, res) => {
  try {
    const { id } = req.params;
    let { data } = req.body;

    const booking = await Booking.findById(id)
      .populate("user", "name email")
      .populate({ path: "lawyer", populate: { path: "user", select: "name" } });

    if (!booking) return res.status(404).json({ success: false, message: "Case not found" });

    let additionalData = {};
    try { additionalData = typeof data === "string" ? JSON.parse(data) : data || {}; } catch (e) {}

    const aiInput = [
      {
        role: "user",
        content: `
          BOOKING DETAILS:
          Type: ${booking.booking_type}
          Status: ${booking.status}
          Notes: ${booking.notes || "N/A"}
          Client: ${booking.user?.name || "Unknown"}
          Lawyer: ${booking.lawyer?.user?.name || "Unknown"}
          
          ADDITIONAL CONTEXT:
          ${additionalData.summary || ""}
        `,
      },
    ];

    const aiResponse = await askAiLegalAssistant(aiInput, "CASE_INTELLIGENCE_REPORT");
    let aiReportStr = (aiResponse.reply || "").replace(/```json/g, "").replace(/```/g, "").trim();

    let aiReport;
    try {
      const jsonMatch = aiReportStr.match(/\{[\s\S]*\}/);
      aiReport = jsonMatch ? JSON.parse(jsonMatch[0]) : { case_overview_summary: aiReportStr };
    } catch (e) {
      aiReport = { case_overview_summary: aiReportStr || "Analysis failed." };
    }

    return res.json({
      success: true,
      data: { case_id: id, generated_at: new Date(), report: aiReport },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
