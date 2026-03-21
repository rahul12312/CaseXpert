const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateLanguagePreference,
  forgotPassword,
  resetPassword
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


// Protected routes

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, upload.single('profileImage'), updateUserProfile);
router.put("/update-language", verifyToken, updateLanguagePreference);

module.exports = router;
