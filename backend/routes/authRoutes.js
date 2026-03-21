const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateLanguagePreference
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);


// Protected routes

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, upload.single('profileImage'), updateUserProfile);
router.put("/update-language", verifyToken, updateLanguagePreference);

module.exports = router;
