const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    case: { type: mongoose.Schema.Types.ObjectId, ref: "LegalCase", default: null },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    report_type: { type: String, default: "general" },
    file_url: { type: String, default: null },
    status: {
      type: String,
      enum: ["draft", "submitted", "reviewed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
