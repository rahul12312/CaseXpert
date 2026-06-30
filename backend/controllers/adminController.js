const Lawyer = require("../models/Lawyer");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Document = require("../models/Document");
const Case = require("../models/Case");
const s3Service = require("../services/s3Service");

// ============================================================================
// GET ALL LAWYERS (Admin View)
// ============================================================================
exports.getAllLawyersAdmin = async (req, res) => {
  try {
    const lawyers = await Lawyer.find()
      .populate("user", "name email phone profile_image")
      .sort({ verification_status: 1, createdAt: -1 });

    const sorted = lawyers.sort((a, b) => {
      const order = { PENDING_VERIFICATION: 0, VERIFIED: 1, REJECTED: 2 };
      return (order[a.verification_status] || 1) - (order[b.verification_status] || 1);
    });

    // Flatten for frontend display
    const flattened = sorted.map(l => {
        const obj = l.toObject();
        return {
            ...obj,
            id: obj._id.toString(), // Ensure id is present for frontend
            name: l.user?.name || 'Unknown',
            email: l.user?.email || 'N/A',
            phone: l.user?.phone || '',
            profile_image: l.user?.profile_image || null
        };
    });

    return res.json({ success: true, lawyers: flattened });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching lawyers", error: error.message });
  }
};

// ============================================================================
// GET LAWYER DETAILS (Admin View)
// ============================================================================
exports.getLawyerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined") return res.status(400).json({ success: false, message: "Invalid lawyer ID" });

    const lawyer = await Lawyer.findById(id).populate("user", "name email phone profile_image is_verified user_type");
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });

    // Fetch documents for this user
    let docsWithUrls = [];
    try {
      const docs = await Document.find({ user: lawyer.user._id }).sort({ createdAt: -1 });
      docsWithUrls = await Promise.all(
        docs.map(async (doc) => {
          let url = doc.file_url;
          if (doc.file_url && doc.file_url.startsWith("s3://")) {
            try { url = await s3Service.getPresignedDownloadUrl(doc.file_url.replace("s3://", ""), 3600); } catch (e) {}
          }
          return { ...doc.toObject(), url };
        })
      );
    } catch (docError) {
      console.error("⚠️ Error fetching documents:", docError.message);
    }

    const lawyerFlattened = {
      ...lawyer.toObject(),
      id: lawyer._id.toString(),
      name: lawyer.user?.name || 'Unknown',
      email: lawyer.user?.email || 'N/A',
      phone: lawyer.user?.phone || '',
      profile_image: lawyer.user?.profile_image || null,
      documents: docsWithUrls
    };

    return res.json({ success: true, lawyer: lawyerFlattened });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalLawyers, verifiedLawyers, pendingLawyers, rejectedLawyers] = await Promise.all([
      Lawyer.countDocuments(),
      Lawyer.countDocuments({ verification_status: "VERIFIED" }),
      Lawyer.countDocuments({ verification_status: "PENDING_VERIFICATION" }),
      Lawyer.countDocuments({ verification_status: "REJECTED" }),
    ]);

    const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
    ]);

    const topLawyers = await Booking.aggregate([
      { $group: { _id: "$lawyer", case_count: { $sum: 1 } } },
      { $sort: { case_count: -1 } },
      { $limit: 5 },
      { $lookup: { from: "lawyers", localField: "_id", foreignField: "_id", as: "lawyer" } },
      { $unwind: "$lawyer" },
      { $lookup: { from: "users", localField: "lawyer.user", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { lawyer_name: "$user.name", specialization: "$lawyer.specialization", case_count: 1 } },
    ]);

    const [totalCases, pendingCases, activeCases, closedCases] = await Promise.all([
      Case.countDocuments(),
      Case.countDocuments({ status: "pending" }),
      Case.countDocuments({ status: "active" }),
      Case.countDocuments({ status: "closed" })
    ]);

    // Simple monthly data mock (could be aggregated from Cases/Payments in the future)
    const monthlyData = [
      { name: 'Jan', cases: 10, revenue: 2400 },
      { name: 'Feb', cases: 15, revenue: 1398 },
      { name: 'Mar', cases: 8, revenue: 9800 },
      { name: 'Apr', cases: 20, revenue: 3908 },
      { name: 'May', cases: 25, revenue: 4800 },
      { name: 'Jun', cases: Math.floor(totalCases / 2) + 1, revenue: 3800 },
      { name: 'Jul', cases: totalCases, revenue: 4300 },
    ];

    return res.json({
      success: true,
      stats: {
        lawyers: { total: totalLawyers, verified: verifiedLawyers, pending: pendingLawyers, rejected: rejectedLawyers },
        consultations: { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings },
        cases: { total: totalCases, pending: pendingCases, active: activeCases, closed: closedCases },
        topLawyers,
        monthlyData
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};

// ============================================================================
// GET ALL CASES ADMIN
// ============================================================================
exports.getAllCasesAdmin = async (req, res) => {
  try {
    const cases = await Case.find()
      .populate("user", "name email")
      .populate({
        path: "lawyer",
        populate: { path: "user", select: "name" }
      })
      .sort({ createdAt: -1 });

    const flattened = cases.map(c => ({
      id: c._id.toString(),
      title: c.title,
      client_name: c.user?.name || "Unknown Client",
      lawyer_name: c.lawyer?.user?.name || "",
      status: c.status,
      created_at: c.createdAt
    }));

    return res.json({ success: true, cases: flattened });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching cases" });
  }
};

// ============================================================================
// GET ALL APPOINTMENTS ADMIN
// ============================================================================
exports.getAllAppointmentsAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "lawyer",
        populate: { path: "user", select: "name" }
      })
      .sort({ date: -1, time: -1 });

    const flattened = bookings.map(b => ({
      id: b._id.toString(),
      client: b.user?.name || "Unknown Client",
      lawyer: b.lawyer?.user?.name || "Unknown Lawyer",
      date: new Date(b.date).toLocaleDateString(),
      time: b.time,
      type: b.type === "video" ? "Video" : "In-person",
      status: b.status.charAt(0).toUpperCase() + b.status.slice(1)
    }));

    return res.json({ success: true, appointments: flattened });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching appointments" });
  }
};

// ============================================================================
// GET ALL CLIENTS ADMIN
// ============================================================================
exports.getAllClientsAdmin = async (req, res) => {
  try {
    const clients = await User.find({ user_type: "client" }).sort({ createdAt: -1 });

    const flattened = await Promise.all(clients.map(async c => {
      const caseCount = await Case.countDocuments({ user: c._id });

      // Find the most recent booking to get the assigned lawyer
      let lawyerName = "Unassigned";
      let lawyerId = null;
      try {
        const latestBooking = await Booking.findOne({ user: c._id })
          .sort({ createdAt: -1 })
          .populate({ path: "lawyer", populate: { path: "user", select: "name" } });
        if (latestBooking && latestBooking.lawyer) {
          lawyerName = latestBooking.lawyer.user?.name || "Assigned";
          lawyerId = latestBooking.lawyer._id.toString();
        }
      } catch (_) {}

      return {
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        phone: c.phone || "N/A",
        cases: caseCount,
        status: c.is_verified ? "Active" : "Onboarding",
        lawyer: lawyerName,
        lawyer_id: lawyerId,
        joined: c.createdAt
      };
    }));

    return res.json({ success: true, clients: flattened });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching clients" });
  }
};
    }));

    return res.json({ success: true, clients: flattened });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching clients" });
  }
};

// ============================================================================
// VERIFY LAWYER
// ============================================================================
exports.verifyLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { verification_status: "VERIFIED", license_verified: true },
      { new: true }
    );
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });
    return res.json({ success: true, message: "Lawyer verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error verifying lawyer", error: error.message });
  }
};

// ============================================================================
// REJECT LAWYER
// ============================================================================
exports.rejectLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { verification_status: "REJECTED", license_verified: false },
      { new: true }
    );
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });
    return res.json({ success: true, message: "Lawyer rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error rejecting lawyer", error: error.message });
  }
};
