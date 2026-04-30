const mongoose = require("mongoose");

const legalVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    video_url: { type: String, required: true },
    thumbnail_url: { type: String, default: "" },
    category: { type: String, default: "general" },
    instructor: { type: String, default: "CaseXpert Legal" },
    duration: { type: String, default: "0:00" },
    published_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegalVideo", legalVideoSchema);
