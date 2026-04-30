const Case = require("../models/Case");
const Hearing = require("../models/Hearing");
const Lawyer = require("../models/Lawyer");
const Booking = require("../models/Booking");
const path = require("path");
const fs = require("fs").promises;
const { askAiLegalAssistant } = require("../services/aiLegalAssistantGroq");
const notificationService = require("../services/notificationService");

// ============================================================================
// CREATE A NEW CASE
// ============================================================================
exports.createCase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, case_number, case_type, lawyer_id, priority, court_name, filing_date, opponent_name, opponent_lawyer } = req.body;

    if (!title || !case_number) {
      return res.status(400).json({ success: false, message: "Title and Case Number are required" });
    }

    let verifiedLawyerId = null;
    let assignmentStatus = "UNASSIGNED";

    if (lawyer_id) {
      const lawyer = await Lawyer.findById(lawyer_id).populate("user");
      if (lawyer && lawyer.user && lawyer.user.is_verified) {
        // Check for completed consultation
        const booking = await Booking.findOne({ user: userId, lawyer: lawyer_id, status: { $in: ["completed", "confirmed"] } });
        if (booking) {
          verifiedLawyerId = lawyer_id;
          assignmentStatus = "REQUESTED";
        } else {
          return res.status(403).json({ success: false, message: "No completed consultation with this lawyer." });
        }
      }
    }

    const newCase = await Case.create({
      user: userId,
      lawyer: verifiedLawyerId,
      title: title.trim(),
      case_number: case_number.trim(),
      description: description || `Case: ${title}`,
      case_type: case_type || "other",
      priority: priority || "medium",
      court_name: court_name || "",
      filing_date: filing_date || null,
      opponent_name: opponent_name || "",
      opponent_lawyer: opponent_lawyer || "",
      assignment_status: assignmentStatus,
      timeline: [{ event_title: "Case Created", event_description: `Case "${title}" was created`, event_type: "case-created" }],
      activities: [{ activity: `Case created: ${title}`, actor_name: req.user.name || "User", actor_role: "user", activity_type: "create" }],
    });

    return res.status(201).json({
      success: true,
      message: verifiedLawyerId ? "Case created and request sent to lawyer" : "Case created successfully",
      data: { case_id: newCase._id, case_number: newCase.case_number, title: newCase.title },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Case number already exists." });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// GET CASE LIST
// ============================================================================
exports.getCaseList = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.user_type || req.user.role;

    let cases = [];
    if (role === "lawyer") {
      const lawyer = await Lawyer.findOne({ user: userId });
      if (lawyer) {
        cases = await Case.find({ lawyer: lawyer._id, assignment_status: "ACCEPTED", status: { $ne: "archived" } })
          .populate("user", "name email phone")
          .sort({ updatedAt: -1 });
      }
    } else {
      cases = await Case.find({ user: userId, status: { $ne: "archived" } })
        .populate({ path: "lawyer", populate: { path: "user", select: "name" } })
        .sort({ updatedAt: -1 });
    }
    return res.json({ success: true, data: cases });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// GET CASE DETAILS
// ============================================================================
exports.getCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.id;
    const role = req.user.user_type || req.user.role;

    const caseData = await Case.findById(caseId)
      .populate("user", "name email phone")
      .populate({ path: "lawyer", populate: { path: "user", select: "name email phone" } });

    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    // Access check
    let hasAccess = caseData.user._id.toString() === userId;
    if (!hasAccess && role === "lawyer") {
      const lawyer = await Lawyer.findOne({ user: userId });
      if (lawyer && caseData.lawyer && caseData.lawyer._id.toString() === lawyer._id.toString()) {
        hasAccess = ["ACCEPTED", "REQUESTED"].includes(caseData.assignment_status);
      }
    }

    if (!hasAccess) return res.status(403).json({ success: false, message: "Access denied" });

    // Fetch separate hearings
    const hearings = await Hearing.find({ case: caseId }).sort({ hearing_date: -1 });

    return res.json({ success: true, data: { ...caseData.toObject(), hearings } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// UPDATE CASE DETAILS
// ============================================================================
exports.updateCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { lawyer_id, ...updates } = req.body;
    const userId = req.user.id;

    const caseData = await Case.findById(caseId);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    if (lawyer_id && lawyer_id !== (caseData.lawyer ? caseData.lawyer.toString() : null)) {
      const booking = await Booking.findOne({ user: userId, lawyer: lawyer_id, status: "completed" });
      if (!booking) return res.status(403).json({ success: false, message: "No completed consultation with this lawyer." });
      caseData.lawyer = lawyer_id;
      caseData.assignment_status = "REQUESTED";
    }

    Object.assign(caseData, updates);
    caseData.activities.push({ activity: "Case details updated", actor_name: req.user.name, actor_role: req.user.role, activity_type: "update" });
    await caseData.save();

    return res.json({ success: true, message: "Case updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// UPDATE CASE STATUS
// ============================================================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const caseData = await Case.findById(req.params.id).populate("user");
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const oldStatus = caseData.status;
    caseData.status = status;
    caseData.timeline.push({ event_title: "Status Changed", event_description: `Status changed from "${oldStatus}" to "${status}"`, event_type: "status-change" });
    caseData.activities.push({ activity: `Status changed to: ${status}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "status-change" });
    await caseData.save();

    try {
      await notificationService.triggerUpdateNotifications(caseData, status, `Your case status updated to ${status} by ${req.user.name}.`);
    } catch (e) {}

    return res.json({ success: true, message: "Case status updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// ADD CASE UPDATE
// ============================================================================
exports.addUpdate = async (req, res) => {
  try {
    const { case_id, update_title, update_description, update_type } = req.body;
    const caseData = await Case.findById(case_id);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    caseData.updates.push({ title: update_title, description: update_description, update_type: update_type || "general-update", created_by: req.user.name });
    caseData.activities.push({ activity: `Added update: ${update_title}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "update" });
    await caseData.save();

    return res.json({ success: true, message: "Case update added" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// UPLOAD DOCUMENT
// ============================================================================
exports.uploadDocument = async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const caseData = await Case.findById(case_id);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const doc = {
      file_name: req.file.filename,
      original_name: req.file.originalname,
      file_url: `/uploads/cases/${req.file.filename}`,
      file_type: path.extname(req.file.originalname).substring(1),
      file_size: req.file.size,
      uploaded_by: req.user.name,
    };

    caseData.documents.push(doc);
    caseData.timeline.push({ event_title: "Document Uploaded", event_description: `Document "${doc.original_name}" uploaded`, event_type: "document-upload" });
    caseData.activities.push({ activity: `Uploaded document: ${doc.original_name}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "document-upload" });
    await caseData.save();

    return res.json({ success: true, message: "Document uploaded", data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// DELETE DOCUMENT
// ============================================================================
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId, caseId } = req.params;
    const caseData = await Case.findById(caseId);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const doc = caseData.documents.id(documentId);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    const originalName = doc.original_name;
    caseData.documents.pull(documentId);
    caseData.activities.push({ activity: `Deleted document: ${originalName}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "document-delete" });
    await caseData.save();

    return res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// RENAME DOCUMENT
// ============================================================================
exports.renameDocument = async (req, res) => {
  try {
    const { documentId, caseId } = req.params;
    const { newName } = req.body;
    const caseData = await Case.findById(caseId);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const doc = caseData.documents.id(documentId);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    const oldName = doc.original_name;
    doc.original_name = newName;
    caseData.activities.push({ activity: `Renamed document from "${oldName}" to "${newName}"`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "document-rename" });
    await caseData.save();

    return res.json({ success: true, message: "Document renamed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// SUMMARIZE DOCUMENT
// ============================================================================
exports.summarizeDocument = async (req, res) => {
  try {
    const { documentId, caseId } = req.body;
    const caseData = await Case.findById(caseId);
    const doc = caseData?.documents.id(documentId);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    let extractedText = "(Content unavailable)";
    if (doc.file_type === "txt") {
      const filePath = path.join(__dirname, "../../", doc.file_url);
      extractedText = await fs.readFile(filePath, "utf8").catch(() => "(Content unavailable)");
    }

    const aiResponse = await askAiLegalAssistant([{ role: "user", content: `Summarize: ${extractedText.substring(0, 5000)}` }], "DOCUMENT_SUMMARIZER");
    return res.json({ success: true, summary: aiResponse.answer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// ADD TIMELINE EVENT
// ============================================================================
exports.addTimelineEvent = async (req, res) => {
  try {
    const { case_id, event_title, event_description, event_type, event_date } = req.body;
    const caseData = await Case.findById(case_id);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    caseData.timeline.push({ event_title, event_description, event_type: event_type || "other", event_date });
    caseData.activities.push({ activity: `Added timeline event: ${event_title}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "timeline-add" });
    await caseData.save();

    return res.json({ success: true, message: "Timeline event added" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// ASSIGN CASE TO LAWYER
// ============================================================================
exports.assignCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { lawyer_id } = req.body;
    const caseData = await Case.findById(id);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const lawyer = await Lawyer.findById(lawyer_id).populate("user");
    if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });

    caseData.lawyer = lawyer_id;
    caseData.assignment_status = "REQUESTED";
    caseData.activities.push({ activity: `Case assigned to lawyer: ${lawyer.user.name}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "update" });
    await caseData.save();

    return res.json({ success: true, message: "Case assigned and notification sent" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// UPDATE STATUS AND NOTIFY (POST Version)
// ============================================================================
exports.updateStatusAndNotify = async (req, res) => {
  try {
    const { case_id, status, message } = req.body;
    const caseData = await Case.findById(case_id).populate("user");
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const oldStatus = caseData.status;
    caseData.status = status;
    caseData.timeline.push({ event_title: "Status Update", event_description: message || `Status changed to ${status}`, event_type: "status-change" });
    caseData.activities.push({ activity: `Status updated: ${status}`, actor_name: req.user.name, actor_role: req.user.role, activity_type: "status-change" });
    await caseData.save();

    try {
      await notificationService.triggerUpdateNotifications(caseData, status, message || `Your case status is now ${status}`);
    } catch (e) {}

    return res.json({ success: true, message: "Status updated and user notified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// DELETE CASE (SOFT)
// ============================================================================
exports.deleteCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    caseData.status = "archived";
    caseData.activities.push({ activity: "Case archived", actor_name: req.user.name, actor_role: req.user.role, activity_type: "delete" });
    await caseData.save();

    return res.json({ success: true, message: "Case archived successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// ADD HEARING
// ============================================================================
exports.addHearing = async (req, res) => {
  try {
    const { case_id, hearing_date, court_room, judge_name, hearing_type, hearing_summary } = req.body;
    const caseData = await Case.findById(case_id);
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

    const hearing = await Hearing.create({
      case: case_id,
      hearing_date,
      court_room: court_room || caseData.court_name,
      judge_name,
      hearing_type: hearing_type || "Regular",
      hearing_summary,
      status: "Scheduled",
    });

    caseData.timeline.push({ event_title: "Hearing Scheduled", event_description: `Next hearing on ${new Date(hearing_date).toLocaleDateString()}`, event_type: "hearing", event_date: hearing_date });
    caseData.activities.push({ activity: "New hearing scheduled", actor_name: req.user.name, actor_role: req.user.role, activity_type: "update" });
    await caseData.save();

    return res.status(201).json({ success: true, message: "Hearing scheduled", data: hearing });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// UPDATE HEARING
// ============================================================================
exports.updateHearing = async (req, res) => {
  try {
    const { hearing_id } = req.params;
    const updateData = req.body;
    const hearing = await Hearing.findByIdAndUpdate(hearing_id, updateData, { new: true });
    if (!hearing) return res.status(404).json({ success: false, message: "Hearing not found" });

    return res.json({ success: true, message: "Hearing updated", data: hearing });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// ADMIN / DEBUG ENDPOINTS
// ============================================================================
exports.getAllCases = async (req, res) => {
  try {
    const cases = await Case.find().populate("user", "name").populate({ path: "lawyer", populate: { path: "user", select: "name" } });
    return res.json({ success: true, data: cases });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCasePermanently = async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    await Hearing.deleteMany({ case: req.params.id });
    return res.json({ success: true, message: "Case and related hearings permanently deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedSampleCases = async (req, res) => {
  try {
    // Basic seeder for testing
    const sample = {
        title: "Sample Property Dispute",
        case_number: `CASE-${Date.now()}`,
        description: "Automated sample case created via seeder.",
        user: req.user.id,
        case_type: "property",
        priority: "medium",
        status: "open"
    };
    const c = await Case.create(sample);
    return res.json({ success: true, message: "Sample case seeded", data: c });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// GET ACTIVITIES
// ============================================================================
exports.getActivities = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.case_id).select("activities");
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });
    return res.json({ success: true, data: caseData.activities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
