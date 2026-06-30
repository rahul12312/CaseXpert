const ChatSession = require("../models/ChatSession");
const { askAiLegalAssistant } = require("../services/aiLegalAssistantGroq");
const pdfParse = require("pdf-parse");

// ============================================================================
// SEND CHAT MESSAGE
// ============================================================================
const sendChatMessage = async (req, res) => {
  const startTime = Date.now();
  let { message: userMessage, task, language = "en", sessionId } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) return res.status(401).json({ success: false, message: "User authentication required" });
    if (!userMessage?.trim()) return res.json({ success: true, aiResponse: "Please enter a valid legal question.", timestamp: new Date() });

    let session;
    if (!sessionId) {
      const title = userMessage.length > 40 ? userMessage.substring(0, 40) + "..." : userMessage;
      session = await ChatSession.create({ user: userId, title, session_type: task || "general_legal" });
      sessionId = session._id;
    } else {
      session = await ChatSession.findOne({ _id: sessionId, user: userId });
      if (!session) return res.status(403).json({ success: false, message: "Session not found or access denied" });
    }

    // Add user message
    session.messages.push({ role: "user", message: userMessage.trim() });

    // Prepare history for AI
    const history = session.messages
      .filter((m) => !m.is_deleted)
      .map((m) => ({ role: m.role, content: m.message }));

    const { reply, source } = await askAiLegalAssistant(history, task, language);
    const processingTime = Date.now() - startTime;

    // Add assistant response
    session.messages.push({
      role: "assistant",
      message: reply,
      model_used: `groq-${source}`,
      processing_time_ms: processingTime,
    });

    session.last_activity_at = new Date();
    await session.save();

    return res.json({
      success: true,
      sessionId: session._id,
      session: { id: session._id, title: session.title, created_at: session.createdAt },
      uiResponse: reply, // Legacy key
      aiResponse: reply,
      source,
      disclaimer: "⚖️ This is general legal information only, not legal advice.",
      timestamp: new Date(),
    });
  } catch (err) {
    return res.json({ success: true, aiResponse: "I encountered an error. Please try again.", source: "system_error", timestamp: new Date() });
  }
};

// ============================================================================
// GET CHAT SESSIONS
// ============================================================================
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Auth required" });

    const sessions = await ChatSession.find({ user: userId, is_active: true }).sort({ last_activity_at: -1 }).limit(50);

    // Simple grouping
    const grouped = { today: [], yesterday: [], lastWeek: [], lastMonth: [], older: [] };
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    sessions.forEach((s) => {
      const d = new Date(s.last_activity_at);
      d.setHours(0, 0, 0, 0);
      const diff = (now - d) / (1000 * 60 * 60 * 24);

      if (diff === 0) grouped.today.push(s);
      else if (diff === 1) grouped.yesterday.push(s);
      else if (diff <= 7) grouped.lastWeek.push(s);
      else if (diff <= 30) grouped.lastMonth.push(s);
      else grouped.older.push(s);
    });

    return res.json({ success: true, sessions, groupedSessions: grouped, total: sessions.length });
  } catch (err) {
    return res.json({ success: true, sessions: [], groupedSessions: {}, total: 0 });
  }
};

// ============================================================================
// GET SESSION MESSAGES
// ============================================================================
const getSessionMessages = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.sessionId, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    return res.json({
      success: true,
      session,
      messages: session.messages.filter((m) => !m.is_deleted),
      total: session.messages.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// CREATE NEW SESSION
// ============================================================================
const createNewSession = async (req, res) => {
  try {
    const { title = "New Chat", sessionType = "general_legal" } = req.body;
    const session = await ChatSession.create({ user: req.user.id, title, session_type: sessionType });
    return res.json({ success: true, session, message: "New session created" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================================
// DELETE SESSION
// ============================================================================
const deleteSession = async (req, res) => {
  try {
    await ChatSession.updateOne({ _id: req.params.sessionId, user: req.user.id }, { is_active: false });
    return res.json({ success: true, message: "Session deleted" });
  } catch (err) {
    return res.json({ success: false, message: "Error deleting session" });
  }
};

// ============================================================================
// IMAGE OCR USING GROQ VISION API (llama-3.2-11b-vision-preview)
// ============================================================================
const extractTextFromImageWithGroq = async (imageBuffer, mimeType) => {
  const Groq = require("groq-sdk");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
          {
            type: "text",
            text: "Extract ALL text visible in this image verbatim. Include every word, number, date, heading, and paragraph exactly as it appears. Do not summarize or skip any text. Return only the raw extracted text.",
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
};

// ============================================================================
// UPLOAD DOCUMENT FOR CHAT
// ============================================================================
const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    let { sessionId } = req.body;

    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    let session;
    if (!sessionId || sessionId === "null") {
      session = await ChatSession.create({
        user: userId,
        title: `Chat about ${file.originalname}`,
        session_type: "document_analysis",
      });
      sessionId = session._id;
    } else {
      session = await ChatSession.findOne({ _id: sessionId, user: userId });
      if (!session) return res.status(403).json({ success: false, message: "Session not found" });
    }

    // Get file buffer — supports both memory storage (file.buffer) and disk storage (file.path)
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      const fs = require("fs").promises;
      fileBuffer = await fs.readFile(file.path);
    } else {
      return res.status(400).json({ success: false, message: "Could not read uploaded file" });
    }

    const ext = file.originalname.toLowerCase();
    const isImage = file.mimetype.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif"].some(e => ext.endsWith(e));
    const isPdf = file.mimetype === "application/pdf" || ext.endsWith(".pdf");

    let fileContent = "";

    // ── PDF: extract text with pdf-parse ────────────────────────────────────
    if (isPdf) {
      try {
        console.log("📄 Parsing PDF...");
        const pdfData = await pdfParse(fileBuffer);
        fileContent = pdfData.text?.trim() || "";
        if (!fileContent) fileContent = "[PDF appears to be empty or image-only — try uploading as an image for OCR]";
        console.log(`✅ PDF parsed: ${fileContent.length} chars extracted`);
      } catch (pdfErr) {
        fileContent = "[Error reading PDF content]";
      }
    // ── IMAGE: use Groq Vision OCR ──────────────────────────────────────────
    } else if (isImage) {
      try {
        console.log(`🔍 Running Groq Vision OCR on ${file.originalname}...`);
        const mimeType = file.mimetype || "image/png";
        fileContent = await extractTextFromImageWithGroq(fileBuffer, mimeType);
        fileContent = fileContent?.trim() || "";
        if (!fileContent) fileContent = "[No text found in this image]";
        console.log(`✅ Groq OCR complete: ${fileContent.length} characters extracted`);
      } catch (ocrErr) {
        console.error("❌ Groq Vision OCR failed:", JSON.stringify(ocrErr?.error || ocrErr?.message || ocrErr));
        fileContent = `[OCR failed: ${ocrErr?.error?.message || ocrErr?.message || "Unknown error"}]`;
      }
    }

    // ── Plain text files ────────────────────────────────────────────────────
    else {
      fileContent = fileBuffer.toString("utf8").trim() || "[Empty file]";
    }

    // Save extracted content into the chat session as context
    session.messages.push({
      role: "system",
      message: `[DOCUMENT UPLOADED]\nFilename: ${file.originalname}\nContent:\n${fileContent.substring(0, 15000)}`,
    });
    session.last_activity_at = new Date();
    await session.save();

    return res.json({
      success: true,
      message: "Document uploaded and text extracted successfully",
      sessionId,
      filename: file.originalname,
      extractedLength: fileContent.length,
    });
  } catch (err) {
    console.error("uploadDocument error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendChatMessage, getChatSessions, getSessionMessages, createNewSession, deleteSession, uploadDocument };
