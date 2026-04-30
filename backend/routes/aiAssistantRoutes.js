// ============================================================================
// AI Legal Assistant Routes - Powered by OpenAI
// ============================================================================

const express = require("express");
const router = express.Router();

// Use Groq Service
const { askAiLegalAssistant } = require("../services/aiLegalAssistantGroq");

/**
 * POST /api/ai-legal-assistant/chat
 * Chat with the AI Legal Assistant using Groq
 */
router.post("/chat", async (req, res) => {
  try {
    console.log("\n📨 AI Chat POST request received (Groq)");

    const { question, history, task } = req.body;

    // Validate input
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question is required and must be a non-empty string"
      });
    }

    // Build messages array
    const messages = [];

    // 1. Add conversation history (if any)
    if (Array.isArray(history) && history.length > 0) {
      history.forEach(msg => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // 2. Add the current user question
    messages.push({
      role: "user",
      content: question
    });

    console.log(`   Total messages to send: ${messages.length}`);

    // Call Groq API
    // returns { reply, source }
    const response = await askAiLegalAssistant(messages, task);

    console.log("   ✅ AI response received");

    return res.json({
      success: true,
      answer: response.reply,
      source: response.source,
      disclaimer: "⚖️ This is general legal information only, not legal advice (Powered by Groq).",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("   ❌ Error in chat route:", err);
    // Return user-friendly error message, never 500
    return res.json({
      success: false, // Or true with fallback? User asked for fallback "ONLY if Groq throws".
      // My service returns fallback on error. But if THIS catch block is hit (e.g. req processing), 
      // I should probably conform to the "Return HTTP 200" rule.
      answer: "I encountered an internal error. Please try again.",
      source: "fallback",
      error: err.message
    });
  }
});

/**
 * GET /api/ai-legal-assistant/health
 * Health check for AI service
 */
router.get("/health", (req, res) => {
  const isConfigured = !!process.env.GROQ_API_KEY;

  res.json({
    success: true,
    service: "AI Legal Assistant",
    status: isConfigured ? "configured" : "not configured",
    message: isConfigured
      ? "AI Legal Assistant is ready (Groq)"
      : "Groq API key is not configured",
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/ai-legal-assistant/info
 * Get information about the AI Legal Assistant
 */
router.get("/info", (req, res) => {
  res.json({
    success: true,
    name: "AI Legal Assistant",
    description: "An AI-powered legal information assistant for CaseXpert",
    capabilities: [
      "Explain legal concepts in simple language",
      "Help draft basic legal documents",
      "Provide information about Indian law",
      "Answer general legal questions",
      "Explain legal procedures and processes"
    ],
    limitations: [
      "Not a licensed lawyer or advocate",
      "Cannot provide formal legal advice",
      "Cannot guarantee legal outcomes",
      "Should not replace consultation with a qualified lawyer"
    ],
    disclaimer: "This AI provides general legal information only. Always consult a qualified lawyer for specific legal matters.",
    model: "Groq LLaMA 3 70B",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
