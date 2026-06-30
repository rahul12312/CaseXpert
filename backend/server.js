const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from the same directory as server.js
dotenv.config({ path: path.join(__dirname, ".env") });

const connectMongoDB = require("./config/mongodb");

// Initialize Express app
const app = express();

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
connectMongoDB();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://casexperts.netlify.app",
      "https://casexpert.netlify.app",
      "https://casexperts.vercel.app",
      "https://casexpert.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes(origin + "/") ||
      origin.endsWith(".netlify.app") ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Static Folders
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Base API Routes
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const caseRoutes = require("./routes/caseRoutes");
const documentRoutes = require("./routes/documentRoutes");
const userDocumentRoutes = require("./routes/userDocumentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiAssistantRoutes = require("./routes/aiAssistantRoutes");
const aiChatRoutes = require("./routes/aiChatRoutes");
const lawyerDashboardRoutes = require("./routes/lawyerDashboardRoutes");
const lawyerLocationRoutes = require("./routes/lawyerLocationRoutes");
const lawyerMarketplaceRoutes = require("./routes/lawyerMarketplaceRoutes");
const legalUpdatesRoutes = require("./routes/legalUpdatesRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const insightRoutes = require("./routes/insightRoutes");
const govDocRoutes = require("./routes/governmentDocumentSampleRoutes");
const videoRoutes = require("./routes/videoRoutes");
const contactRoutes = require("./routes/contactRoutes");
const aiDocumentRoutes = require("./routes/aiDocumentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/lawyer", lawyerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/cases", caseRoutes); 
app.use("/api/documents", documentRoutes);
app.use("/api/user-documents", userDocumentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai-assistant", aiAssistantRoutes);
app.use("/api/chat", aiChatRoutes);
app.use("/api/lawyer-dashboard", lawyerDashboardRoutes);
app.use("/api/lawyer-location", lawyerLocationRoutes);
app.use("/api/lawyers", lawyerMarketplaceRoutes);
app.use("/api/updates", legalUpdatesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/gov-docs", govDocRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/ai-document", aiDocumentRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ success: true, message: "CaseXpert MongoDB API", version: "3.0.0", status: "running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 CaseXpert Backend (MongoDB) Started");
  console.log(`📡 Port: ${PORT} | Env: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(60) + "\n");
});

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

module.exports = app;
