const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { analyzeDocument, chatAboutDocument } = require('../services/aiDocumentService');

// Configure multer for memory storage (we just need the buffer to extract text)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are supported'));
    }
  }
});

/**
 * POST /api/ai-document/analyze
 * Uploads a document, extracts text, and returns AI analysis (Summary, Risks, Obligations)
 */
router.post('/analyze', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document uploaded' });
    }

    let documentText = '';

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      documentText = pdfData.text;
    } else if (req.file.mimetype === 'text/plain') {
      documentText = req.file.buffer.toString('utf-8');
    }

    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract any text. If this is a scanned PDF (image only), it is not supported yet. Please upload a text-based PDF or TXT file.' 
      });
    }

    // Call Groq AI Service
    const analysisResult = await analyzeDocument(documentText);

    return res.status(200).json({
      success: true,
      data: analysisResult,
      rawText: documentText // Return raw text so frontend can use it for follow-up chat
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during document analysis' 
    });
  }
});

/**
 * POST /api/ai-document/chat
 * Chat with the AI specifically about the uploaded document
 */
router.post('/chat', async (req, res) => {
  try {
    const { documentText, question, history } = req.body;

    if (!documentText || !question) {
      return res.status(400).json({ success: false, message: 'Document text and question are required' });
    }

    const answer = await chatAboutDocument(documentText, question, history || []);

    return res.status(200).json({
      success: true,
      answer
    });

  } catch (error) {
    console.error('Error in document chat:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during chat' 
    });
  }
});

module.exports = router;
