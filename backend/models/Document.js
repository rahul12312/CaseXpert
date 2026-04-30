const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    case: { type: mongoose.Schema.Types.ObjectId, ref: "LegalCase", default: null },
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    file_type: { type: String, default: null },
    file_size: { type: Number, default: null },
    description: { type: String, default: "" },
    is_public: { type: Boolean, default: false },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
