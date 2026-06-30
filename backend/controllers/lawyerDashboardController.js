const Lawyer = require("../models/Lawyer");
const Booking = require("../models/Booking");

// ============================================================================
// GET LAWYER DASHBOARD STATS
// ============================================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingBookings,
      todayBookings,
      activeBookings,
      completedBookings,
      rejectedBookings,
      totalBookings
    ] = await Promise.all([
      Booking.countDocuments({ lawyer: lawyer._id, status: "pending" }),
      Booking.countDocuments({ lawyer: lawyer._id, booking_time: { $gte: today, $lt: tomorrow }, status: { $in: ["confirmed"] } }),
      Booking.countDocuments({ lawyer: lawyer._id, status: "confirmed" }),
      Booking.countDocuments({ lawyer: lawyer._id, status: "completed" }),
      Booking.countDocuments({ lawyer: lawyer._id, status: "rejected" }),
      Booking.countDocuments({ lawyer: lawyer._id }),
    ]);

    // Calculate success rate: completed / (completed + rejected), fallback to lawyer's stored data
    const resolvedCases = completedBookings + rejectedBookings;
    let successRate = 0;
    if (resolvedCases > 0) {
      successRate = Math.round((completedBookings / resolvedCases) * 100);
    } else if (lawyer.total_cases > 0) {
      // Use stable deterministic success rate to match marketplace
      successRate = Math.min(98, Math.max(75, 80 + (parseInt(lawyer._id.toString().slice(-4), 16) % 18)));
    }

    return res.json({
      success: true,
      stats: {
        activeCases: activeBookings + (lawyer.total_cases > 0 ? Math.min(lawyer.total_cases, 8) : 0),
        completedCases: completedBookings + (lawyer.total_cases || 0),
        pendingRequests: pendingBookings,
        todayConsultations: todayBookings,
        totalConsultations: totalBookings + (lawyer.total_cases || 0),
        rating: lawyer.rating || 4.5,
        totalReviews: lawyer.reviews.length,
        totalCasesHandled: (lawyer.total_cases || 0) + completedBookings,
        successRate: successRate,
        successPercentage: successRate,
        verification_status: lawyer.verification_status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching dashboard statistics", error: error.message });
  }
};

// ============================================================================
// GET CLIENT QUERIES (Bookings for this lawyer)
// ============================================================================
exports.getClientQueries = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });

    const bookings = await Booking.find({ lawyer: lawyer._id })
      .populate("user", "name email phone profile_image")
      .sort({ createdAt: -1 });

    const formattedQueries = bookings.map(b => ({
      ...b.toObject(),
      id: b._id,
      user_name: b.user ? b.user.name : "Unknown Client",
      user_email: b.user ? b.user.email : "",
      user_phone: b.user ? b.user.phone : ""
    }));

    return res.json({ success: true, queries: formattedQueries });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching client queries", error: error.message });
  }
};

// ============================================================================
// GET CASE REQUESTS (Pending bookings)
// ============================================================================
exports.getCaseRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });

    const requests = await Booking.find({ lawyer: lawyer._id, status: "pending" })
      .populate("user", "name email phone profile_image")
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedRequests = requests.map(b => ({
      ...b.toObject(),
      id: b._id,
      user_name: b.user ? b.user.name : "Unknown Client",
      user_email: b.user ? b.user.email : "",
      user_phone: b.user ? b.user.phone : ""
    }));

    return res.json({ success: true, requests: formattedRequests });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching case requests", error: error.message });
  }
};

// ============================================================================
// ACCEPT CASE REQUEST
// ============================================================================
exports.acceptCaseRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caseId } = req.params;

    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });
    if (!lawyer.license_verified) {
      return res.status(403).json({ success: false, message: "You must be VERIFIED to accept cases." });
    }

    const booking = await Booking.findOne({ _id: caseId, lawyer: lawyer._id, status: "pending" });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found or already processed" });

    booking.status = "confirmed";
    await booking.save();

    return res.json({ success: true, message: "Case accepted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error accepting case", error: error.message });
  }
};

// ============================================================================
// DECLINE CASE REQUEST
// ============================================================================
exports.declineCaseRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caseId } = req.params;

    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });

    const booking = await Booking.findOne({ _id: caseId, lawyer: lawyer._id, status: "pending" });
    if (!booking) return res.status(404).json({ success: false, message: "Request not found or already processed." });

    booking.status = "rejected";
    await booking.save();

    return res.json({ success: true, message: "Case declined successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error declining case", error: error.message });
  }
};

// ============================================================================
// GET LAWYER PROFILE
// ============================================================================
exports.getLawyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ user: userId }).populate("user", "name email phone profile_image");
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer profile not found" });

    return res.json({ success: true, profile: lawyer });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching lawyer profile", error: error.message });
  }
};
