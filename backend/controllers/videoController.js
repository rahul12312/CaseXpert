const Case = require("../models/Case");
const Booking = require("../models/Booking");
const Lawyer = require("../models/Lawyer");
const generateTwilioToken = require("../utils/generateTwilioToken");
const { generateZoomSignature } = require("../utils/generateZoomSignature");

// Generate Access Token for Video Consultation
exports.getToken = async (req, res) => {
  try {
    const { room, username } = req.body;
    const userId = req.user.id;
    const userRole = req.user.user_type || req.user.role;

    if (!room) return res.status(400).json({ message: "Room name is required" });

    const roomId = room.replace("consultation_", "");
    const type = roomId.charAt(0).toUpperCase(); // 'B' or 'C'
    const id = type === "B" || type === "C" ? roomId.substring(1) : roomId;

    let hasAccess = false;
    let participantNames = { lawyer: '', client: '' };

    if (type === "B" || !["B", "C"].includes(type)) {
      const booking = await Booking.findById(id)
        .populate({ path: 'user', select: 'name' })
        .populate({ path: 'lawyer', populate: { path: 'user', select: 'name' } });
        
      if (booking) {
        const clientName = booking.user?.name || 'Client';
        const lawyerName = booking.lawyer?.user?.name || 'Lawyer';
        
        participantNames.client = `${clientName} (Client)`;
        // Ensure Adv. is only added once
        const cleanLawyerName = lawyerName.startsWith('Adv.') ? lawyerName : `Adv. ${lawyerName}`;
        participantNames.lawyer = `${cleanLawyerName} (Lawyer)`;

        if (booking.user && (booking.user._id || booking.user).toString() === userId) {
          hasAccess = true;
        } else if (booking.lawyer && booking.lawyer.user && (booking.lawyer.user._id || booking.lawyer.user).toString() === userId) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess && (type === "C" || !["B", "C"].includes(type))) {
      const caseData = await Case.findById(id)
        .populate({ path: 'user', select: 'name' })
        .populate({ path: 'lawyer', populate: { path: 'user', select: 'name' } });

      if (caseData) {
        const clientName = caseData.user?.name || 'Client';
        const lawyerName = caseData.lawyer?.user?.name || 'Lawyer';
        
        participantNames.client = `${clientName} (Client)`;
        const cleanLawyerName = lawyerName.startsWith('Adv.') ? lawyerName : `Adv. ${lawyerName}`;
        participantNames.lawyer = `${cleanLawyerName} (Lawyer)`;

        if (caseData.user && (caseData.user._id || caseData.user).toString() === userId) {
          hasAccess = true;
        } else if (caseData.lawyer && caseData.lawyer.user && (caseData.lawyer.user._id || caseData.lawyer.user).toString() === userId) {
          hasAccess = true;
        }
      }
    }

    const isAdmin = (userRole === "lawyer" || userRole === 1);
    let targetIdentity = (isAdmin ? participantNames.lawyer : participantNames.client) || username || 'Guest';

    if (!hasAccess) return res.status(403).json({ message: "Access denied to consultation room" });

    // Detect platform from booking if not provided in request
    let platform = req.body.platform;
    let bookingRecord = null;
    
    if (type === "B") {
      bookingRecord = await Booking.findById(id).select("meeting");
      if (!platform) {
        platform = bookingRecord && bookingRecord.meeting ? bookingRecord.meeting.platform : "twilio";
      }
    }
    platform = platform || "twilio";

    if (platform === "zoom") {
        if (!bookingRecord || !bookingRecord.meeting || !bookingRecord.meeting.meeting_id) {
            return res.json({ 
                platform: "zoom", 
                status: "WAITING",
                message: "Zoom meeting has not been created yet. Please wait..." 
            });
        }

        const realZoomMeetingId = bookingRecord.meeting.meeting_id;
        const role = isAdmin ? 1 : 0;
        const signature = generateZoomSignature(realZoomMeetingId, role);
        
        // Final response object
        const responseData = { 
            platform: "zoom",
            signature,
            sdkKey: process.env.ZOOM_SDK_KEY,
            meetingNumber: realZoomMeetingId,
            userName: targetIdentity,
            userRole: role,
            zoomJoinUrl: bookingRecord.meeting.zoom_join_url || null
        };

        // ONLY send host-specific credentials to the Lawyer
        if (isAdmin) {
            responseData.zoomStartUrl = bookingRecord.meeting.zoom_start_url || null;
            responseData.zakToken = bookingRecord.meeting.zoom_zak_token || null;
        }
        
        responseData.zoomPassword = bookingRecord.meeting.zoom_password || null;

        return res.json(responseData);
    }

    // Default to Twilio
    const token = generateTwilioToken(targetIdentity, room);
    return res.json({ platform: "twilio", token });
  } catch (error) {
    console.error("❌ Token Generation Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error generating token", error: error.message });
  }
};
