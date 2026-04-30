const mongoose = require("mongoose");

const legalUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    summary: { type: String, default: "" },
    source: { type: String, default: "" },
    source_url: { type: String, default: "" },
    category: { type: String, default: "general" },
    tags: { type: [String], default: [] },
    image_url: { type: String, default: null },
    is_published: { type: Boolean, default: true },
    published_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LegalUpdate", legalUpdateSchema);
