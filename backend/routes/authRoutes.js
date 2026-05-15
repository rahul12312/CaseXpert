const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateLanguagePreference,
  changePassword,
  sendOTP,
  verifyOTPAndRegister,
  resendOTP,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

// ── Public routes ─────────────────────────────────────────
router.post("/register", registerUser);          // legacy
router.post("/login", loginUser);

// OTP-based registration (new 2-step flow)
router.post("/send-otp", sendOTP);               // Step 1: send OTP
router.post("/verify-otp", verifyOTPAndRegister); // Step 2: verify OTP → activate
router.post("/resend-otp", resendOTP);            // Resend OTP

// Password Reset (Public)
router.post("/forgot-password", require("../controllers/authController").forgotPassword);
router.post("/reset-password/:token", require("../controllers/authController").resetPassword);

// ── Protected routes ──────────────────────────────────────
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, upload.single("profileImage"), updateUserProfile);
router.put("/change-password", verifyToken, changePassword);
router.put("/update-language", verifyToken, updateLanguagePreference);

module.exports = router;
