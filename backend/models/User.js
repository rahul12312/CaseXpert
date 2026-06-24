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
