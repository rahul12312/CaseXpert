const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Lawyer = require("../models/Lawyer");
const { sendOTPEmail, sendPasswordResetEmail } = require("../services/emailService");

// ============================================================
// HELPERS
// ============================================================
const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.user_type,
      user_type: user.user_type,
      preferred_language: user.preferred_language || "en",
    },
    process.env.JWT_SECRET || "fallback-secret-key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

const hashOTP = (otp) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// ============================================================
// STEP 1 — SEND OTP (called before account is created)
// POST /api/auth/send-otp
// ============================================================
exports.sendOTP = async (req, res) => {
  console.log("\n🔵 SEND OTP CALLED");
  try {
    const { name, email, phone, password, role, user_type, gender, state, city, languages, selectedLanguages, experienceYears, specialization, barIdNumber } = req.body;

    const userType = role || user_type || "client";
    const finalUserType = userType === "user" ? "client" : userType;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    // Check if a verified account already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.is_verified) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    // Check OTP resend rate limit (60 seconds)
    if (existing && existing.otp_last_sent) {
      const secondsSinceLast = (Date.now() - new Date(existing.otp_last_sent).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLast);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
          waitSeconds,
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const now = new Date();

    if (existing && !existing.is_verified) {
      // Update existing unverified record
      existing.name = name;
      existing.phone = phone || null;
      existing.password = password;
      existing.user_type = finalUserType;
      existing.otp = otpHash;
      existing.otp_expires = otpExpires;
      existing.otp_last_sent = now;
      // Store extra fields in a temp object (we'll use them in verifyOTP)
      existing._tempData = { gender, state, city, languages: languages || selectedLanguages, experienceYears, specialization, barIdNumber };
      await existing.save();
    } else {
      // Create new unverified user
      await User.create({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password,
        user_type: finalUserType,
        is_verified: false,
        otp: otpHash,
        otp_expires: otpExpires,
        otp_last_sent: now,
      });
    }

    // Respond immediately — don't wait for email delivery
    console.log(`✅ OTP saved for ${email} — sending email in background`);
    res.status(200).json({
      success: true,
      message: `Verification code sent to ${email}`,
      email: email.toLowerCase(),
    });

    // Send OTP email asynchronously (fire-and-forget)
    sendOTPEmail({ userEmail: email, userName: name, otp })
      .then((result) => {
        if (result.success) {
          console.log(`📧 OTP email delivered to ${email}`);
        } else {
          console.error(`❌ OTP email failed for ${email}:`, result.error);
        }
      })
      .catch((err) => {
        console.error(`❌ OTP email error for ${email}:`, err.message);
      });

  } catch (error) {
    console.error("❌ SEND OTP ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

// ============================================================
// STEP 2 — VERIFY OTP & ACTIVATE ACCOUNT
// POST /api/auth/verify-otp
// ============================================================
exports.verifyOTPAndRegister = async (req, res) => {
  console.log("\n🔵 VERIFY OTP CALLED");
  try {
    const { email, otp, role, user_type, experienceYears, specialization, barIdNumber, languages, selectedLanguages } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No registration found for this email. Please register first." });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: "This account is already verified. Please login." });
    }

    // Check OTP expiry
    if (!user.otp_expires || new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Verify OTP
    const hashedInput = hashOTP(otp.toString().trim());
    if (hashedInput !== user.otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
    }

    // Mark account as verified
    user.is_verified = true;
    user.otp = null;
    user.otp_expires = null;
    user.otp_last_sent = null;
    await user.save();

    // Create lawyer profile if applicable
    const finalUserType = user.user_type;
    if (finalUserType === "lawyer") {
      try {
        const existingLawyer = await Lawyer.findOne({ user: user._id });
        if (!existingLawyer) {
          const specArray = Array.isArray(specialization)
            ? specialization
            : specialization ? specialization.split(",").map((s) => s.trim()) : [];
          const langArray = Array.isArray(languages || selectedLanguages)
            ? (languages || selectedLanguages)
            : (languages || selectedLanguages) ? (languages || selectedLanguages).split(",").map((l) => l.trim()) : [];

          await Lawyer.create({
            user: user._id,
            specialization: specArray.join(", ") || "General",
            experience: experienceYears || 0,
            languages: langArray,
            verification_status: "PENDING_VERIFICATION",
          });
          console.log("✅ Lawyer profile created after OTP verification");
        }
      } catch (lawyerErr) {
        console.error("⚠️ Failed to create lawyer profile:", lawyerErr.message);
      }
    }

    const token = signToken(user);

    console.log("✅ OTP verified, account activated for:", email);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to CaseXpert.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.user_type,
        user_type: user.user_type,
        is_verified: true,
        profile_image: user.profile_image,
      },
      token,
    });

  } catch (error) {
    console.error("❌ VERIFY OTP ERROR:", error.message);
    return res.status(500).json({ success: false, message: "OTP verification failed", error: error.message });
  }
};

// ============================================================
// RESEND OTP
// POST /api/auth/resend-otp
// ============================================================
exports.resendOTP = async (req, res) => {
  console.log("\n🔵 RESEND OTP CALLED");
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No registration found for this email" });
    }

    if (user.is_verified) {
      return res.status(400).json({ success: false, message: "Account already verified. Please login." });
    }

    // Rate limit — 60 seconds between resends
    if (user.otp_last_sent) {
      const secondsSinceLast = (Date.now() - new Date(user.otp_last_sent).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLast);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
          waitSeconds,
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    user.otp = otpHash;
    user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    user.otp_last_sent = new Date();
    await user.save();

    // Respond immediately — send email in background
    console.log(`✅ OTP resaved for ${email} — resending email in background`);
    res.status(200).json({ success: true, message: `New verification code sent to ${email}` });

    sendOTPEmail({ userEmail: email, userName: user.name, otp })
      .then((result) => {
        if (result.success) {
          console.log(`📧 Resend OTP email delivered to ${email}`);
        } else {
          console.error(`❌ Resend OTP email failed for ${email}:`, result.error);
        }
      })
      .catch((err) => {
        console.error(`❌ Resend OTP email error for ${email}:`, err.message);
      });

  } catch (error) {
    console.error("❌ RESEND OTP ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to resend OTP", error: error.message });
  }
};

// ============================================================
// REGISTER USER (legacy — kept for backward compat)
// ============================================================
exports.registerUser = async (req, res) => {
  console.log("\n🔵 REGISTER USER CALLED (legacy)");
  try {
    const { name, email, phone, password, role, user_type } = req.body;
    const userType = role || user_type || "client";
    const finalUserType = userType === "user" ? "client" : userType;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.is_verified) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }

    const user = await User.create({ name, email, phone: phone || null, password, user_type: finalUserType, is_verified: true });

    if (finalUserType === "lawyer") {
      try {
        const { specialization, experienceYears, languages } = req.body;
        const specArray = Array.isArray(specialization) ? specialization : specialization ? specialization.split(",").map((s) => s.trim()) : [];
        const langArray = Array.isArray(languages) ? languages : languages ? languages.split(",").map((l) => l.trim()) : [];
        await Lawyer.create({ user: user._id, specialization: specArray.join(", ") || "General", experience: experienceYears || 0, languages: langArray, verification_status: "PENDING_VERIFICATION" });
      } catch (lawyerErr) {
        console.error("⚠️ Failed to create lawyer profile:", lawyerErr.message);
      }
    }

    const token = signToken(user);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.user_type,
        user_type: user.user_type,
        profile_image: user.profile_image,
      },
      token,
    });
  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// ============================================================
// LOGIN USER
// ============================================================
exports.loginUser = async (req, res) => {
  console.log("\n🔵 LOGIN USER CALLED");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    // Block login for unverified accounts
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);
    console.log("✅ Login successful");

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.user_type,
        user_type: user.user_type,
        is_verified: user.is_verified,
        profile_image: user.profile_image,
      },
      token,
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// ============================================================
// GET USER PROFILE
// ============================================================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -reset_password_token -reset_password_expires -otp -otp_expires -otp_last_sent");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
  }
};

// ============================================================
// UPDATE USER PROFILE
// ============================================================
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const update = { name, phone };

    if (req.file) {
      update.profile_image = req.file.path; // Cloudinary URL
    }

    await User.findByIdAndUpdate(req.user.id, update);

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile_image: update.profile_image || undefined,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
};

// ============================================================
// UPDATE LANGUAGE PREFERENCE
// ============================================================
exports.updateLanguagePreference = async (req, res) => {
  try {
    const { preferred_language } = req.body;
    const supportedLanguages = ["en", "hi", "mr"];

    if (!preferred_language || !supportedLanguages.includes(preferred_language)) {
      return res.status(400).json({ success: false, message: "Invalid language. Supported: en, hi, mr" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { preferred_language }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const newToken = signToken(user);
    return res.json({ success: true, message: "Language preference updated successfully", token: newToken, preferred_language: user.preferred_language });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating language", error: error.message });
  }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================
exports.changePassword = async (req, res) => {
  console.log("\n🔵 CHANGE PASSWORD CALLED");
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ success: false, message: "Password must include uppercase, lowercase, number and special character" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect current password" });

    user.password = newPassword;
    await user.save();

    console.log("✅ Password changed successfully");
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ CHANGE PASSWORD ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Error changing password", error: error.message });
  }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.reset_password_token = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.reset_password_expires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    await sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.name,
      resetUrl
    });

    console.log(`🔑 Reset email sent to: ${user.email}`);

    return res.json({ 
      success: true, 
      message: "Password reset link sent to your email",
      // Dev only: return token if email service not fully configured
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in forgot password", error: error.message });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      reset_password_token: hashedToken,
      reset_password_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error in reset password", error: error.message });
  }
};
