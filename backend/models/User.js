const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    password: { type: String, required: true },
    user_type: { type: String, enum: ["client", "lawyer", "admin"], default: "client" },
    profile_image: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    preferred_language: { type: String, enum: ["en", "hi", "mr"], default: "en" },
    email_notifications: { type: Boolean, default: true },
    two_factor_auth: { type: Boolean, default: false },
    reset_password_token: { type: String, default: null },
    reset_password_expires: { type: Date, default: null },
    // OTP fields for email verification
    otp: { type: String, default: null },
    otp_expires: { type: Date, default: null },
    otp_last_sent: { type: Date, default: null },
    
    // ==========================================
    // EXTENDED PROFILE FIELDS
    // ==========================================
    client_id: { type: String, unique: true, sparse: true },
    
    // Basic Information
    dob: { type: Date, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"], default: "Prefer not to say" },
    occupation: { type: String, default: null },
    nationality: { type: String, default: null },
    marital_status: { type: String, enum: ["Single", "Married", "Divorced", "Widowed", "Separated", "Prefer not to say"], default: "Prefer not to say" },
    blood_group: { type: String, default: null },
    
    // Contact Information
    alternate_phone: { type: String, default: null },
    emergency_contact: { type: String, default: null },
    preferred_communication: { type: String, enum: ["Phone", "Email", "WhatsApp"], default: "Email" },
    address: {
      street: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      pin_code: { type: String, default: null }
    },
    
    // Identity Details
    identity: {
      aadhaar: { type: String, default: null },
      pan: { type: String, default: null },
      passport: { type: String, default: null },
      driving_license: { type: String, default: null },
      proof_url: { type: String, default: null }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
