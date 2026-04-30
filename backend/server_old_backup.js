const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS Configuration - Allow all origins for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced Request logging middleware
app.use((req, res, next) => {
  console.log('\n' + '='.repeat(60));
  console.log(`📥 Incoming Request:`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Body:`, req.body);
  console.log(`   Headers:`, req.headers);
  console.log('='.repeat(60));
  next();
});

// Import database connection (this will test the connection)
require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/lawyer", lawyerRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CaseXpert Backend API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      lawyers: "/api/lawyer"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('\n' + '❌'.repeat(30));
  console.error('🚨 ERROR OCCURRED:');
  console.error('   Message:', err.message);
  console.error('   Stack:', err.stack);
  console.error('   Status:', err.status || 500);
  console.error('❌'.repeat(30) + '\n');
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? {
      message: err.message,
      stack: err.stack
    } : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🚀 CaseXpert Backend Server Started");
  console.log("=".repeat(50));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
  console.log("=".repeat(50));
  console.log("\n📋 Available Endpoints:");
  console.log("   POST   /api/auth/register     - Register new user");
  console.log("   POST   /api/auth/login        - Login user");
  console.log("   GET    /api/auth/profile      - Get user profile (protected)");
  console.log("   PUT    /api/auth/profile      - Update user profile (protected)");
  console.log("   POST   /api/lawyer/add        - Add lawyer profile (protected)");
  console.log("   GET    /api/lawyer            - Get all lawyers");
  console.log("   GET    /api/lawyer/:id        - Get lawyer by ID");
  console.log("   PUT    /api/lawyer/:id        - Update lawyer (protected)");
  console.log("   DELETE /api/lawyer/:id        - Delete lawyer (admin only)");
  console.log("=".repeat(50));
});

module.exports = app;
