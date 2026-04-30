const mongoose = require("mongoose");

const hearingSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    hearing_date: { type: Date, required: true },
    purpose: { type: String, default: "Other" },
    courtroom: { type: String, default: "" },
    judge_name: { type: String, default: "" },
    notes: { type: String, default: "" },
    outcome: { type: String, default: "" },
    next_hearing_date: { type: Date, default: null },
    next_hearing_purpose: { type: String, default: "" },
    adjournment_reason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hearing", hearingSchema);
