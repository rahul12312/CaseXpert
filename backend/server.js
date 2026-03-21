// ============================================================================
// CaseXpert Backend Server
// ============================================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { createDatabasePool, getDatabase } = require("./config/database");

// Load environment variables
dotenv.config();
console.log("Environment check:");
console.log("GROQ_API_KEY loaded:", !!process.env.GROQ_API_KEY);

// Initialize Express app
const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS - Allow all origins with explicit configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Body parser with size limit
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Request logging - Log every incoming request
app.use((req, res, next) => {
  console.log("API HIT:", req.originalUrl);
  console.log(`  Method: ${req.method}`);
  console.log(`  Time: ${new Date().toISOString()}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Test route - Always works
app.get("/api/test", (req, res) => {
  res.json({ status: "ok", message: "Backend is running", timestamp: new Date().toISOString() });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CaseXpert Backend API",
    version: "2.0.0",
    status: "running",
    database: "connected"
  });
});

// Import and use routes with error handling
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Failed to load auth routes:", error.message);
}

try {
  const lawyerRoutes = require("./routes/lawyerRoutes");
  app.use("/api/lawyer", lawyerRoutes);
  console.log("✅ Lawyer routes loaded");
} catch (error) {
  console.error("❌ Failed to load lawyer routes:", error.message);
}

try {
  const bookingRoutes = require("./routes/bookingRoutes");
  app.use("/api/bookings", bookingRoutes);
  console.log("✅ Booking routes loaded");
} catch (error) {
  console.error("❌ Failed to load booking routes:", error.message);
}

try {
  const caseRoutes = require("./routes/caseRoutes");
  app.use("/api/case", caseRoutes);
  app.use("/api/cases", caseRoutes); // Added alias for backward/pluarity compatibility 
  console.log("✅ Case routes loaded");
} catch (error) {
  console.error("❌ Failed to load case routes:", error.message);
}

try {
  const documentRoutes = require("./routes/documentRoutes");
  app.use("/api/documents", documentRoutes);
  console.log("✅ Document routes loaded");
} catch (error) {
  console.error("❌ Failed to load document routes:", error.message);
}

try {
  const userDocumentRoutes = require("./routes/userDocumentRoutes");
  app.use("/api/user-documents", userDocumentRoutes);
  console.log("✅ User document routes loaded");
} catch (error) {
  console.error("❌ Failed to load user document routes:", error.message);
}

try {
  const adminRoutes = require("./routes/adminRoutes");
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes loaded");
} catch (error) {
  console.error("❌ Failed to load admin routes:", error.message);
}

try {
  const aiAssistantRoutes = require("./routes/aiAssistantRoutes");
  app.use("/api/ai-assistant", aiAssistantRoutes);
  console.log("✅ AI Assistant routes loaded");
} catch (error) {
  console.error("❌ Failed to load AI Assistant routes:", error.message);
}

try {
  const aiChatRoutes = require("./routes/aiChatRoutes");
  app.use("/api/chat", aiChatRoutes);
  console.log("✅ AI Chat routes loaded");
} catch (error) {
  console.error("❌ Failed to load AI Chat routes:", error.message);
}

try {
  const lawyerDashboardRoutes = require("./routes/lawyerDashboardRoutes");
  app.use("/api/lawyer-dashboard", lawyerDashboardRoutes);
  console.log("✅ Lawyer Dashboard routes loaded");
} catch (error) {
  console.error("❌ Failed to load Lawyer Dashboard routes:", error.message);
}

try {
  const lawyerLocationRoutes = require("./routes/lawyerLocationRoutes");
  app.use("/api/lawyer-location", lawyerLocationRoutes);
  console.log("✅ Lawyer Location routes loaded");
} catch (error) {
  console.error("❌ Failed to load Lawyer Location routes:", error.message);
}

try {
  const lawyerMarketplaceRoutes = require("./routes/lawyerMarketplaceRoutes");
  app.use("/api/lawyers", lawyerMarketplaceRoutes);
  console.log("✅ Lawyer Marketplace routes loaded at /api/lawyers");
} catch (error) {
  console.error("❌ Failed to load Lawyer Marketplace routes:", error.message);
}

try {
  const legalUpdatesRoutes = require("./routes/legalUpdatesRoutes");
  app.use("/api/updates", legalUpdatesRoutes);
  console.log("✅ Legal Updates routes loaded");
} catch (error) {
  console.error("❌ Failed to load Legal Updates routes:", error.message);
}

try {
  const reportsRoutes = require("./routes/reportsRoutes");
  app.use("/api/reports", reportsRoutes);
  console.log("✅ Reports routes loaded");
} catch (error) {
  console.error("❌ Failed to load Reports routes:", error.message);
}

try {
  const insightRoutes = require("./routes/insightRoutes");
  app.use("/api/insights", insightRoutes);
  console.log("✅ Insight routes loaded");
} catch (error) {
  console.error("❌ Failed to load Insight routes:", error.message);
}

try {
  const governmentDocumentSampleRoutes = require("./routes/governmentDocumentSampleRoutes");
  app.use("/api/gov-docs", governmentDocumentSampleRoutes);
  console.log("✅ Government Document Sample routes loaded");
} catch (error) {
  console.error("❌ Failed to load Government Document Sample routes:", error.message);
}

try {
  const videoRoutes = require("./routes/videoRoutes");
  app.use("/api/video", videoRoutes);
  console.log("✅ Video routes loaded");
} catch (error) {
  console.error("❌ Failed to load video routes:", error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  console.error("   Stack:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

let server;

const startServer = () => {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log("=".repeat(60));
    console.log("🚀 CaseXpert Backend Server Started");
    console.log("=".repeat(60));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("=".repeat(60));
    console.log("\n📋 Key Endpoints:");
    console.log("   GET    /api/test              - Test endpoint");
    console.log("   POST   /api/auth/register     - Register user");
    console.log("   POST   /api/auth/login        - Login user");
    console.log("   GET    /api/auth/profile      - Get profile");
    console.log("   GET    /api/lawyer            - Get lawyers");
    console.log("=".repeat(60) + "\n");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use!`);
      console.error("   Run: Get-Process node | Stop-Process -Force");
      process.exit(1);
    } else {
      console.error("❌ Server error:", err.message);
      process.exit(1);
    }
  });
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} - Shutting down...`);
  if (server) {
    server.close(() => {
      console.log("✅ Server closed");
      const database = getDatabase();
      if (database) {
        database.end().then(() => {
          console.log("✅ Database closed");
          process.exit(0);
        }).catch(err => {
          console.error("❌ Error closing database:", err.message);
          process.exit(1);
        });
      } else {
        process.exit(0);
      }
    });
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors - Never crash
process.on("uncaughtException", (err) => {
  console.error("\n❌ Uncaught Exception:", err.message);
  console.error("   Stack:", err.stack);
  console.error("   Server continues running...\n");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("\n❌ Unhandled Rejection:", reason);
  console.error("   Server continues running...\n");
});

// Warn about missing API keys
if (!process.env.GROQ_API_KEY) {
  console.warn("\n⚠️  WARNING: GROQ_API_KEY is missing in .env file.");
  console.warn("   AI Chat features will not work until you add it.");
}

// Ensure database is connected before starting server
createDatabasePool().then(() => {
  startServer();
}).catch(err => {
  console.error("❌ CRITICAL: Failed to initialize database pool:", err.message);
  process.exit(1);
});

module.exports = app;
