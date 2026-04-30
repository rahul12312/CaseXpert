const jwt = require("jsonwebtoken");

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  try {
    // Get token from header (handle mismatched casing if necessary, though Express handles headers lowercased mostly)
    // Using req.header() is safer/more standard in Express to get headers case-insensitively
    const authHeader = req.header("Authorization") || req.header("authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided."
      });
    }

    // Check Format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format. Format should be: Bearer <token>"
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is empty."
      });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({
        success: false,
        message: "Internal server authentication error."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`🔐 Auth Middleware: User ${decoded.id || decoded.userId} (${decoded.user_type || decoded.role}) authenticated`);

    // Ensure unified user structure
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded.sub, // Handle different ID field names
      role: decoded.user_type || decoded.role || 'user', // Handle different role field names
      name: decoded.name || decoded.fullName || decoded.username || 'User'
    };
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
        code: "TOKEN_EXPIRED"
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
        code: "INVALID_TOKEN"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error verifying authentication token",
      error: error.message
    });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.user_type === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }
};

// Check if user is lawyer
exports.isLawyer = (req, res, next) => {
  if (req.user && req.user.user_type === "lawyer") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Lawyer privileges required."
    });
  }
};

// Check if user is client or lawyer
exports.isClientOrLawyer = (req, res, next) => {
  const type = req.user ? req.user.user_type : "";
  if (type === "client" || type === "lawyer") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Client or Lawyer account required."
    });
  }
};

// Flexible role-based middleware - accepts single role or array of roles
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const userRole = req.user.user_type;

    // Check if user's role is in the allowed roles
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: `Access denied. This feature is only available for ${allowedRoles.join(" or ")}s.`,
        requiredRole: allowedRoles,
        yourRole: userRole
      });
    }
  };
};
