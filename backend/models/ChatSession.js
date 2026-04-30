const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  message: { type: String, required: true },
  model_used: { type: String, default: "" },
  processing_time_ms: { type: Number, default: 0 },
  tokens_used: { type: Number, default: 0 },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Chat" },
    session_type: { type: String, default: "general_legal" },
    is_active: { type: Boolean, default: true },
    last_activity_at: { type: Date, default: Date.now },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
