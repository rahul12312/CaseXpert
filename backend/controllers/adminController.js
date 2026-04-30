const Lawyer = require("../models/Lawyer");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Document = require("../models/Document");
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

    return res.json({
      success: true,
      stats: {
        lawyers: { total: totalLawyers, verified: verifiedLawyers, pending: pendingLawyers, rejected: rejectedLawyers },
        consultations: { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings },
        cases: { total: 0, pending: 0, active: 0 },
        topLawyers,
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
    // Return empty for now – LegalCase controller handles its own routes
    return res.json({ success: true, cases: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching cases" });
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
