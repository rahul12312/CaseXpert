const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String, default: "" },
    is_published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const availabilitySchema = new mongoose.Schema({
  day_of_week: { type: String },
  start_time: { type: String },
  end_time: { type: String },
  is_available: { type: Boolean, default: true },
});

const lawyerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, default: "General" },
    experience: { type: Number, default: 0 },
    consultation_fee: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    languages: { type: [String], default: [] },
    bar_council_id: { type: String, default: null },
    bar_council_state: { type: String, default: null },
    enrollment_year: { type: Number, default: null },
    gender: { type: String, default: null },
    license_verified: { type: Boolean, default: false },
    verification_status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "VERIFIED", "REJECTED"],
      default: "PENDING_VERIFICATION",
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    total_cases: { type: Number, default: 0 },
    availability_status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    reviews: [reviewSchema],
    availability: [availabilitySchema],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

lawyerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Lawyer", lawyerSchema);
