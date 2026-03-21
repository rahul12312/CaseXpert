const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail, passwordResetEmail, passwordResetConfirmationEmail } = require("../services/emailService");
const { getDatabase } = require("../config/database");

// Helper function to get database connection
const getDb = () => {
  return getDatabase();
};

// ============================================================================
// REGISTER USER - Never crashes, always returns JSON
// ============================================================================
exports.registerUser = async (req, res) => {
  console.log("\n🔵 REGISTER USER CALLED");

  try {
    const { name, email, phone, password, role, user_type } = req.body;
    const userType = role || user_type || "client";
    const finalUserType = userType === "user" ? "client" : userType;

    console.log("  → Name:", name);
    console.log("  → Email:", email);
    console.log("  → Role:", finalUserType);

    // Validation
    if (!name || !email || !password) {
      console.log("❌ Validation failed");
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Get database
    const database = getDb();
    if (!database) {
      console.error("❌ Database not available");
      return res.status(500).json({
        success: false,
        message: "Database connection not available"
      });
    }

    // Check if user exists - with error handling
    let existingUsers;
    try {
      [existingUsers] = await database.query(
        "SELECT id FROM users WHERE email = ? OR phone = ?",
        [email, phone || null]
      );
    } catch (dbError) {
      console.error("❌ Database query error:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database error while checking user",
        error: dbError.message
      });
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("❌ User already exists");
      return res.status(409).json({
        success: false,
        message: "User with this email or phone already exists"
      });
    }

    // Hash password - with error handling
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error("❌ Password hashing error:", hashError.message);
      return res.status(500).json({
        success: false,
        message: "Error processing password"
      });
    }

    // Insert user - with error handling
    let result;
    try {
      const sql = `INSERT INTO users (name, email, phone, password, user_type, created_at)
                   VALUES (?, ?, ?, ?, ?, NOW())`;

      [result] = await database.query(sql, [
        name,
        email,
        phone || null,
        hashedPassword,
        finalUserType
      ]);
    } catch (insertError) {
      console.error("❌ Database insert error:", insertError.message);
      return res.status(500).json({
        success: false,
        message: "Error creating user account",
        error: insertError.message
      });
    }

    console.log("✅ User created with ID:", result.insertId);

    // Generate JWT - with error handling
    let token;
    try {
      token = jwt.sign(
        {
          id: result.insertId,
          userId: result.insertId,
          name,
          email,
          role: finalUserType,
          user_type: finalUserType,
          preferred_language: 'en'
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );
    } catch (jwtError) {
      console.error("❌ JWT generation error:", jwtError.message);
      // Still return success but without token
      return res.status(201).json({
        success: true,
        message: "User registered but token generation failed",
        user: {
          id: result.insertId,
          name,
          email,
          phone: phone || null,
          role: finalUserType,
          user_type: finalUserType
        }
      });
    }

    // Create lawyer profile if user type is lawyer
    if (finalUserType === 'lawyer') {
      try {
        const { specialization, experienceYears, languages, barIdNumber, location } = req.body;

        // Split specialization and languages if they are strings
        const specArray = Array.isArray(specialization) ? specialization : (specialization ? specialization.split(',').map(s => s.trim()) : []);
        const langArray = Array.isArray(languages) ? languages : (languages ? languages.split(',').map(l => l.trim()) : []);

        const lawyerSql = `
          INSERT INTO lawyers 
          (user_id, specialization, experience, languages, verification_status, created_at)
          VALUES (?, ?, ?, ?, 'PENDING_VERIFICATION', NOW())
        `;

        await database.query(lawyerSql, [
          result.insertId,
          specArray.join(', ') || 'General',
          experienceYears || 0,
          langArray.join(', ') || null
        ]);

        console.log("✅ Skeleton lawyer profile created for admin review");
      } catch (lawyerError) {
        console.error("⚠️ Failed to create lawyer profile entry:", lawyerError.message);
        // We don't fail the whole registration if this fails, but it shouldn't fail
      }
    }

    // Success response
    const userData = {
      id: result.insertId,
      name,
      email,
      phone: phone || null,
      role: finalUserType,
      user_type: finalUserType
    };

    console.log("✅ Registration successful");

    return res.status(201).json({
      user: userData,
      token: token
    });

  } catch (error) {
    // Catch-all error handler
    console.error("\n❌❌❌ REGISTRATION ERROR ❌❌❌");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during registration",
      error: error.message
    });
  }
};

// ============================================================================
// LOGIN USER - Never crashes, always returns JSON
// ============================================================================
exports.loginUser = async (req, res) => {
  console.log("\n🔵 LOGIN USER CALLED");

  try {
    const { email, password } = req.body;

    console.log("  → Email:", email);

    // Validation
    if (!email || !password) {
      console.log("❌ Validation failed");
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Get database
    const database = getDb();
    if (!database) {
      console.error("❌ Database not available");
      return res.status(500).json({
        success: false,
        message: "Database connection not available"
      });
    }

    // Find user - with error handling
    let users;
    try {
      [users] = await database.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
    } catch (dbError) {
      console.error("❌ Database query error:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database error while finding user",
        error: dbError.message
      });
    }

    if (!users || users.length === 0) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    // Check if active
    if (user.is_active === 0) {
      console.log("❌ User is inactive");
      return res.status(403).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    // Verify password - with error handling
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      console.error("❌ Password comparison error:", compareError.message);
      return res.status(500).json({
        success: false,
        message: "Error verifying password"
      });
    }

    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT - with error handling
    let token;
    try {
      token = jwt.sign(
        {
          id: user.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.user_type,
          user_type: user.user_type,
          preferred_language: user.preferred_language || 'en'
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );
    } catch (jwtError) {
      console.error("❌ JWT generation error:", jwtError.message);
      return res.status(500).json({
        success: false,
        message: "Error generating authentication token"
      });
    }

    // Success response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.user_type,
      user_type: user.user_type,
      is_verified: user.is_verified
    };

    console.log("✅ Login successful");

    return res.json({
      user: userData,
      token: token
    });

  } catch (error) {
    // Catch-all error handler
    console.error("\n❌❌❌ LOGIN ERROR ❌❌❌");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login",
      error: error.message
    });
  }
};

// ============================================================================
// GET USER PROFILE - Never crashes, always returns JSON
// ============================================================================
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const database = getDb();
    if (!database) {
      return res.status(500).json({
        success: false,
        message: "Database connection not available"
      });
    }

    const [users] = await database.query(
      "SELECT id, name, email, phone, user_type, profile_image, is_verified, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error("Profile fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE USER PROFILE - Never crashes, always returns JSON
// ============================================================================
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const database = getDb();
    if (!database) {
      return res.status(500).json({
        success: false,
        message: "Database connection not available"
      });
    }

    // Check if file was uploaded
    if (req.file) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
      // Normalize path separators to forward slashes for URL
      const relativePath = `uploads/profiles/${req.file.filename}`;
      const profileImageUrl = `${baseUrl}/${relativePath}`;

      await database.query(
        "UPDATE users SET name = ?, phone = ?, profile_image = ? WHERE id = ?",
        [name, phone, profileImageUrl, userId]
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
        profile_image: profileImageUrl
      });
    } else {
      // No file uploaded, just update text fields
      await database.query(
        "UPDATE users SET name = ?, phone = ? WHERE id = ?",
        [name, phone, userId]
      );

      return res.json({
        success: true,
        message: "Profile updated successfully"
      });
    }

  } catch (error) {
    console.error("Profile update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE LANGUAGE PREFERENCE - Never crashes, always returns JSON
// ============================================================================
exports.updateLanguagePreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferred_language } = req.body;

    // Validate language code
    const supportedLanguages = ['en', 'hi', 'mr'];
    if (!preferred_language || !supportedLanguages.includes(preferred_language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Supported languages: en, hi, mr"
      });
    }

    const database = getDb();
    if (!database) {
      return res.status(500).json({
        success: false,
        message: "Database connection not available"
      });
    }

    // Update language preference
    await database.query(
      "UPDATE users SET preferred_language = ? WHERE id = ?",
      [preferred_language, userId]
    );

    // Generate new JWT with updated language
    const [users] = await database.query(
      "SELECT id, name, email, user_type, preferred_language FROM users WHERE id = ?",
      [userId]
    );

    if (users && users.length > 0) {
      const user = users[0];
      const newToken = jwt.sign(
        {
          id: user.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.user_type,
          user_type: user.user_type,
          preferred_language: user.preferred_language
        },
        process.env.JWT_SECRET || "fallback-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      return res.json({
        success: true,
        message: "Language preference updated successfully",
        token: newToken,
        preferred_language: user.preferred_language
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

  } catch (error) {
    console.error("Language preference update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating language preference",
      error: error.message
    });
  }
};

// ============================================================================
// FORGOT PASSWORD - Sends reset email with token
// ============================================================================
// ============================================================================
// FORGOT PASSWORD - TEMP TEST
// ============================================================================
exports.forgotPassword = async (req, res) => {
  console.log("🚀 Forgot password route hit!");
  return res.json({ message: "Forgot password route working" });
};

// ============================================================================
// RESET PASSWORD - Validates token and updates password
// ============================================================================
exports.resetPassword = async (req, res) => {
  console.log("\n🔵 RESET PASSWORD CALLED");

  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("  → Token received");

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required"
      });
    }

    // Password validation: min 8 chars, uppercase, lowercase, number, special char
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: "Password must include uppercase, lowercase, number and special character"
      });
    }

    // Hash the incoming token to compare with database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Get database
    const database = getDb();
    if (!database) {
      return res.status(500).json({
        success: false,
        message: "Database connection not available"
      });
    }

    // Find user with matching token and non-expired resetPasswordExpire
    const [users] = await database.query(
      "SELECT id, name, email FROM users WHERE resetPasswordToken = ? AND resetPasswordExpire > NOW()",
      [hashedToken]
    );

    if (!users || users.length === 0) {
      console.log("❌ Invalid or expired token");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token"
      });
    }

    const user = users[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and remove reset token fields
    await database.query(
      "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpire = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    console.log("✅ Password reset successful for user:", user.email);

    // Optional: Send confirmation email
    try {
      const confirmationMessage = passwordResetConfirmationEmail(user.name);

      await sendEmail({
        email: user.email,
        subject: "Password Reset Successful - CaseXpert",
        message: confirmationMessage
      });
    } catch (emailError) {
      console.error("⚠️  Confirmation email failed:", emailError.message);
      // Don't fail the request if confirmation email fails
    }

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("\n❌❌❌ RESET PASSWORD ERROR ❌❌❌");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
      error: error.message
    });
  }
};


