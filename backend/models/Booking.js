const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    meeting_id: { type: String },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    platform: { 
      type: String, 
      enum: ["twilio", "zoom"], 
      default: "twilio" 
    },
    status: {
      type: String,
      enum: ["HOST_JOINED", "WAITING_FOR_APPROVAL", "ACTIVE", "ENDED"],
      default: "HOST_JOINED",
    },
    zoom_join_url: { type: String, default: null }, // Added for real Zoom links
    zoom_start_url: { type: String, default: null }, // Added for real Zoom links
    zoom_zak_token: { type: String, default: null }, // Added to prevent host SDK crash
    zoom_password: { type: String, default: null } // Added for URL construction fallbacks
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    booking_number: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "Lawyer", required: true },
    booking_type: { type: String, default: "consultation" },
    booking_time: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    duration: { type: Number, default: 60 },
    cancelled_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cancelled_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
    meeting: { type: meetingSchema, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
