const Booking = require("../models/Booking");
const Lawyer = require("../models/Lawyer");
const User = require("../models/User");

// ============================================================================
// CREATE BOOKING
// ============================================================================
exports.createBooking = async (req, res) => {
  console.log("➡️ POST /api/bookings/book hit");
  try {
    const { lawyerId, consultationType, date, timeSlot, description } = req.body;
    const userId = req.user.id;

    if (!lawyerId || !date || !timeSlot || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const bookingTime = new Date(`${date}T${timeSlot}:00`);

    // Check for double booking
    const existing = await Booking.findOne({
      lawyer: lawyerId,
      booking_time: bookingTime,
      status: { $nin: ["cancelled", "rejected"] },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "This time slot is already booked. Please choose another." });
    }

    const bookingNumber = "BK" + Date.now() + Math.floor(Math.random() * 1000);

    const booking = await Booking.create({
      booking_number: bookingNumber,
      user: userId,
      lawyer: lawyerId,
      booking_type: consultationType || "consultation",
      booking_time: bookingTime,
      notes: description,
      status: "pending",
    });

    const populated = await Booking.findById(booking._id)
      .populate("user", "name email phone profile_image")
      .populate({ path: "lawyer", populate: { path: "user", select: "name email profile_image" } });

    console.log("✅ Booking created:", booking._id);
    return res.status(201).json({
      success: true,
      message: "Consultation request sent successfully",
      data: populated,
      booking: populated,
      bookingId: booking._id,
      bookingNumber,
    });
  } catch (error) {
    console.error("❌ Create Booking Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create booking" });
  }
};

// ============================================================================
// GET USER BOOKINGS
// ============================================================================
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate({ path: "lawyer", select: "specialization consultation_fee", populate: { path: "user", select: "name profile_image" } })
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map(b => ({
      ...b.toObject(),
      id: b._id,
      lawyer_name: b.lawyer && b.lawyer.user ? b.lawyer.user.name : "Unknown Lawyer",
      lawyer_image: b.lawyer && b.lawyer.user ? b.lawyer.user.profile_image : null,
      specialization: b.lawyer ? b.lawyer.specialization : "General"
    }));

    return res.json({ success: true, count: formattedBookings.length, bookings: formattedBookings, data: formattedBookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// ============================================================================
// GET LAWYER BOOKINGS
// ============================================================================
exports.getLawyerBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(403).json({ success: false, message: "Not a registered lawyer" });

    console.log(`🔍 Lawyer ${lawyer._id} status: ${lawyer.verification_status}`);

    const bookings = await Booking.find({ lawyer: lawyer._id })
      .populate("user", "name email phone profile_image")
      .sort({ status: 1, booking_time: 1 });

    const formattedBookings = bookings.map(b => ({
      ...b.toObject(),
      id: b._id,
      user_name: b.user ? b.user.name : "Unknown Client",
      user_email: b.user ? b.user.email : "",
      user_phone: b.user ? b.user.phone : ""
    }));

    return res.json({ success: true, count: formattedBookings.length, bookings: formattedBookings, data: formattedBookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch booking requests" });
  }
};

// ============================================================================
// UPDATE BOOKING STATUS
// ============================================================================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role || req.user.user_type;

    let targetStatus = status.toLowerCase();
    if (targetStatus === "accepted") targetStatus = "confirmed";

    if (!["confirmed", "rejected", "cancelled"].includes(targetStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (role === "lawyer") {
      const lawyer = await Lawyer.findOne({ user: userId });
      if (!lawyer) return res.status(403).json({ message: "Unauthorized" });
      if (lawyer.verification_status !== "VERIFIED") {
        return res.status(403).json({ success: false, message: "Account pending verification.", status: lawyer.verification_status });
      }
      if (booking.lawyer.toString() !== lawyer._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (booking.status !== "pending") {
        return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
      }
      booking.status = targetStatus;
    } else if (role === "client" || role === "user") {
      if (targetStatus !== "cancelled") return res.status(403).json({ message: "Users can only cancel bookings" });
      if (booking.user.toString() !== userId.toString()) return res.status(403).json({ message: "Unauthorized" });
      if (booking.status !== "pending") return res.status(400).json({ message: "Cannot cancel a non-pending booking" });
      booking.status = "cancelled";
      booking.cancelled_by = userId;
      booking.cancelled_at = new Date();
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    await booking.save();
    return res.json({ success: true, message: `Booking ${status} successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update booking status" });
  }
};

// ============================================================================
// GET ALL BOOKINGS (Admin)
// ============================================================================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({ path: "lawyer", populate: { path: "user", select: "name" } })
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch all bookings" });
  }
};

// ============================================================================
// ACCEPT BOOKING (Lawyer)
// ============================================================================
exports.acceptBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(403).json({ success: false, message: "Not registered as a lawyer" });
    if (lawyer.verification_status !== "VERIFIED") {
      return res.status(403).json({ success: false, message: "Only verified lawyers can accept consultations", currentStatus: lawyer.verification_status });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Consultation not found" });

    const bookingLawyerId = booking.lawyer.toString();
    const currentLawyerId = lawyer._id.toString();

    console.log(`🔍 Comparing Lawyer IDs: Booking(${bookingLawyerId}) vs Current(${currentLawyerId})`);

    if (bookingLawyerId !== currentLawyerId) {
      return res.status(403).json({ success: false, message: "You are not assigned to this consultation" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: `Consultation is already ${booking.status}` });
    }

    booking.status = "confirmed";
    await booking.save();

    console.log(`✅ Booking ${id} accepted by Lawyer ${userId}`);
    return res.json({ success: true, message: "Consultation accepted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
// REJECT BOOKING (Lawyer)
// ============================================================================
exports.rejectBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(403).json({ success: false, message: "Unauthorized" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.lawyer.toString() !== lawyer._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    booking.status = "rejected";
    await booking.save();

    return res.json({ success: true, message: "Consultation rejected" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
// GET BOOKING BY ID
// ============================================================================
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id)
      .populate("user", "name email phone profile_image")
      .populate({ path: "lawyer", select: "specialization user", populate: { path: "user", select: "name profile_image" } });

    if (!booking) return res.status(404).json({ success: false, message: "Consultation not found" });

    const lawyer = await Lawyer.findById(booking.lawyer._id);
    const isUser = booking.user._id.toString() === userId.toString();
    const isLawyer = lawyer && lawyer.user.toString() === userId.toString();

    if (!isUser && !isLawyer) {
      return res.status(403).json({ success: false, message: "Not authorized for this consultation" });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
// END CONSULTATION (Lawyer)
// ============================================================================
exports.endConsultation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { duration } = req.body;

    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(403).json({ success: false, message: "Only lawyers can complete consultations" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Consultation not found" });
    if (booking.lawyer.toString() !== lawyer._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ success: false, message: `Cannot complete a ${booking.status} consultation` });
    }

    if (booking.meeting) booking.meeting.status = "ENDED";
    booking.status = "completed";
    booking.duration = duration || 60;
    booking.completed_at = new Date();
    await booking.save();

    return res.json({ success: true, message: "Consultation marked as completed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
// MEETING MANAGEMENT
// ============================================================================
exports.getMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).select("meeting");
    if (!booking || !booking.meeting) return res.json({ success: true, status: "NOT_CREATED" });
    return res.json({ success: true, status: booking.meeting.status, meeting_id: booking.meeting.meeting_id });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.startMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lawyer = await Lawyer.findOne({ user: userId });
    if (!lawyer) return res.status(403).json({ success: false, message: "Unauthorized: Not a lawyer" });

    const booking = await Booking.findById(id).populate("user");
    if (!booking) return res.status(404).json({ success: false, message: "Consultation not found" });
    if (booking.lawyer.toString() !== lawyer._id.toString()) {
      return res.status(403).json({ success: false, message: "This consultation is assigned to another lawyer" });
    }
    if (!["confirmed", "completed"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Consultation must be confirmed to start" });
    }

    const { platform } = req.body;
    let meetingId = `MEET-${id}-${Date.now()}`;
    let zoomJoinUrl = null;
    let zoomStartUrl = null;
    let zoomZakToken = null;
    let zoomPassword = null;

    if (platform === "zoom") {
      try {
        const { createZoomMeeting } = require("../utils/zoomAPI");
        const studentName = booking.user ? booking.user.name : "Client";
        const zoomData = await createZoomMeeting(`CaseXpert Consultation: ${studentName}`);
        meetingId = zoomData.meetingId;
        zoomJoinUrl = zoomData.joinUrl;
        zoomStartUrl = zoomData.startUrl;
        zoomZakToken = zoomData.zakToken;
        zoomPassword = zoomData.password;
      } catch (zoomError) {
        console.error("Zoom API Error:", zoomError);
        return res.status(500).json({ 
          success: false, 
          message: zoomError.message || "Failed to create Zoom Meeting on Zoom Servers.",
          details: zoomError.response?.data
        });
      }
    }

    booking.meeting = {
      meeting_id: meetingId,
      host: userId,
      participant: booking.user._id,
      platform: platform || "twilio",
      status: "HOST_JOINED",
      zoom_join_url: zoomJoinUrl,
      zoom_start_url: zoomStartUrl,
      zoom_zak_token: zoomZakToken,
      zoom_password: zoomPassword || null
    };
    await booking.save();

    return res.json({ success: true, meeting_id: meetingId, status: "HOST_JOINED", zoom_start_url: zoomStartUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.joinMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id).select("meeting");
    if (!booking || !booking.meeting) {
      return res.status(404).json({ success: false, message: "Meeting not yet created by lawyer" });
    }

    const meeting = booking.meeting;
    const hostId = meeting.host.toString();
    const participantId = meeting.participant.toString();

    if (participantId !== userId.toString() && hostId !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized for this meeting" });
    }

    if (hostId === userId.toString()) return res.json({ success: true, status: meeting.status });

    if (meeting.status === "HOST_JOINED") {
      booking.meeting.status = "WAITING_FOR_APPROVAL";
      await booking.save();
      return res.json({ success: true, status: "WAITING_FOR_APPROVAL" });
    }

    return res.json({ success: true, status: meeting.status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveParticipant = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || !booking.meeting) return res.status(404).json({ success: false });
    booking.meeting.status = "ACTIVE";
    await booking.save();
    return res.json({ success: true, status: "ACTIVE" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectParticipant = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || !booking.meeting) return res.status(404).json({ success: false });
    booking.meeting.status = "ENDED";
    await booking.save();
    return res.json({ success: true, status: "ENDED" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
