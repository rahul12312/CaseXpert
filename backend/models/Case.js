const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "Lawyer", default: null },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    case_number: { type: String, unique: true, required: true },
    case_type: { type: String, default: "other" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, default: "pending" },
    assignment_status: { type: String, enum: ["UNASSIGNED", "REQUESTED", "ACCEPTED", "REJECTED"], default: "UNASSIGNED" },
    court_name: { type: String, default: "" },
    filing_date: { type: Date, default: null },
    opponent_name: { type: String, default: "" },
    opponent_lawyer: { type: String, default: "" },
    timeline: [
      {
        event_title: String,
        event_description: String,
        event_type: String,
        event_date: { type: Date, default: Date.now },
      },
    ],
    updates: [
      {
        title: String,
        description: String,
        update_type: String,
        created_by: String,
        created_at: { type: Date, default: Date.now },
      },
    ],
    documents: [
      {
        file_name: String,
        original_name: String,
        file_url: String,
        file_type: String,
        file_size: Number,
        uploaded_by: String,
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    activities: [
      {
        activity: String,
        actor_name: String,
        actor_role: String,
        activity_type: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);
