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

    const [pendingBookings, todayBookings] = await Promise.all([
      Booking.countDocuments({ lawyer: lawyer._id, status: "pending" }),
      Booking.countDocuments({ lawyer: lawyer._id, booking_time: { $gte: today, $lt: tomorrow }, status: { $in: ["confirmed"] } }),
    ]);

    return res.json({
      success: true,
      stats: {
        activeCases: 0,
        completedCases: 0,
        pendingRequests: pendingBookings,
        todayConsultations: todayBookings,
        rating: lawyer.rating,
        totalReviews: lawyer.reviews.length,
        totalCasesHandled: lawyer.total_cases,
        successRate: 0,
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
