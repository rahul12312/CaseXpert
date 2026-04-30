const mongoose = require("mongoose");

const governmentDocumentSampleSchema = new mongoose.Schema(
  {
    document_type: { type: String, required: true },
    document_title: { type: String, required: true },
    document_category: {
      type: String,
      enum: ["Affidavit", "RTI_Application", "Legal_Notice", "Agreement", "Power_of_Attorney", "Will", "Petition", "Application", "Notarized_Document", "Other"],
      required: true,
    },
    authority_source: { type: String, required: true },
    source_url: { type: String, default: "" },
    issuing_department: { type: String, default: "" },
    sample_pdf_url: { type: String, required: true },
    file_size_kb: { type: Number, default: 0 },
    description: { type: String, default: "" },
    language: { type: String, enum: ["English", "Hindi", "Both"], default: "English" },
    applicable_acts: { type: String, default: "" },
    last_verified_date: { type: Date, default: Date.now },
    verification_status: { type: String, enum: ["Verified", "Pending", "Outdated"], default: "Verified" },
    disclaimer: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    view_count: { type: Number, default: 0 },
    download_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GovernmentDocumentSample", governmentDocumentSampleSchema);
