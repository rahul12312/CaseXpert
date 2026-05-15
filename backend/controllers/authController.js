const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Lawyer = require("../models/Lawyer");

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

// ============================================================================
// REGISTER USER
// ============================================================================
exports.registerUser = async (req, res) => {
  console.log("\n🔵 REGISTER USER CALLED");
  try {
    const { name, email, phone, password, role, user_type } = req.body;
    const userType = role || user_type || "client";
    const finalUserType = userType === "user" ? "client" : userType;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "User with this email already exists" });
    }

    const user = await User.create({ name, email, phone: phone || null, password, user_type: finalUserType });

    console.log("✅ User created with ID:", user._id);

    // Create lawyer profile if registering as lawyer
    if (finalUserType === "lawyer") {
      try {
        const { specialization, experienceYears, languages } = req.body;
        const specArray = Array.isArray(specialization)
          ? specialization
          : specialization ? specialization.split(",").map((s) => s.trim()) : [];
        const langArray = Array.isArray(languages)
          ? languages
          : languages ? languages.split(",").map((l) => l.trim()) : [];

        await Lawyer.create({
          user: user._id,
          specialization: specArray.join(", ") || "General",
          experience: experienceYears || 0,
          languages: langArray,
          verification_status: "PENDING_VERIFICATION",
        });
        console.log("✅ Skeleton lawyer profile created");
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

// ============================================================================
// LOGIN USER
// ============================================================================
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

// ============================================================================
// GET USER PROFILE
// ============================================================================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -reset_password_token -reset_password_expires");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
  }
};

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================
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

// ============================================================================
// UPDATE LANGUAGE PREFERENCE
// ============================================================================
exports.updateLanguagePreference = async (req, res) => {
  try {
    const { preferred_language } = req.body;
    const supportedLanguages = ["en", "hi", "mr"];

    if (!preferred_language || !supportedLanguages.includes(preferred_language)) {
      return res.status(400).json({ success: false, message: "Invalid language. Supported: en, hi, mr" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferred_language },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const newToken = signToken(user);

    return res.json({
      success: true,
      message: "Language preference updated successfully",
      token: newToken,
      preferred_language: user.preferred_language,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating language", error: error.message });
  }
};// ============================================================================
// CHANGE PASSWORD
// ============================================================================
exports.changePassword = async (req, res) => {
  console.log("\n🔵 CHANGE PASSWORD CALLED (MongoDB)");
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
      return res.status(400).json({
        success: false,
        message: "Password must include uppercase, lowercase, number and special character"
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    // Update password (hashing is handled by the model's pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log("✅ Password changed successfully (MongoDB)");

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ CHANGE PASSWORD ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Error changing password", error: error.message });
  }
};
