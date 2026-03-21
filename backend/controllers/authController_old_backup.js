const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Register new user
exports.registerUser = async (req, res) => {
  console.log('\n🔵 REGISTER USER CONTROLLER CALLED');
  console.log('📦 Request Body:', req.body);
  
  try {
    // Accept both 'role' (from frontend) and 'user_type' (legacy)
    const { name, email, phone, password, role, user_type } = req.body;
    const userType = role || user_type || "client";
    
    // Map 'user' to 'client' for consistency
    const finalUserType = userType === "user" ? "client" : userType;

    console.log('✅ Extracted data:', { name, email, phone, userType: finalUserType });

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    console.log('✅ Validation passed');

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (existingUsers.length > 0) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        message: "User with this email or phone already exists"
      });
    }

    console.log('✅ User does not exist, proceeding with registration');

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed successfully');

    // Insert user
    console.log('💾 Inserting user into database...');
    const sql = `INSERT INTO users (name, email, phone, password, user_type, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`;

    const [result] = await db.query(sql, [
      name,
      email,
      phone || null,
      hashedPassword,
      finalUserType
    ]);

    console.log('✅ User inserted successfully. User ID:', result.insertId);

    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      { id: result.insertId, email, user_type: finalUserType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    console.log('✅ JWT token generated');

    // Frontend expects: { user: {...}, token: "..." }
    const userData = {
      id: result.insertId,
      name,
      email,
      phone: phone || null,
      role: finalUserType,
      user_type: finalUserType
    };

    const responseData = {
      user: userData,
      token: token
    };

    console.log('📤 Sending success response:', responseData);
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error('\n❌❌❌ REGISTRATION ERROR ❌❌❌');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? {
        code: error.code,
        sqlMessage: error.sqlMessage
      } : {}
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support."
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Frontend expects: { user: {...}, token: "..." }
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.user_type,
      user_type: user.user_type,
      is_verified: user.is_verified
    };

    res.json({
      user: userData,
      token: token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const [users] = await db.query(
      "SELECT id, name, email, phone, user_type, profile_image, is_verified, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, profile_image } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (phone) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (profile_image) {
      updates.push("profile_image = ?");
      values.push(profile_image);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`;
    await db.query(sql, values);

    res.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};
