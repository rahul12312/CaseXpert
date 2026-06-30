// ============================================================================
// AI Document Analyzer Service - Groq Integration
// ============================================================================

const Groq = require("groq-sdk");
const { PROMPTS } = require("./aiPrompts");

let groq = null;

function initializeGroq() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Groq API key is not configured.");
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

/**
 * Analyzes a legal document and returns a structured JSON response
 * @param {string} documentText The raw text extracted from the document
 * @returns {Object} Parsed JSON with summary, risks, obligations, etc.
 */
async function analyzeDocument(documentText) {
    try {
        if (!groq) initializeGroq();

        if (!documentText || documentText.trim().length === 0) {
            throw new Error("Document text is empty");
        }

        console.log("🚀 Starting Document Analysis (Groq LLaMA 3)...");

        // Limit document text to avoid exceeding token limits (~15k characters is safe for 8k context)
        const maxTextLength = 25000;
        const truncatedText = documentText.length > maxTextLength 
            ? documentText.substring(0, maxTextLength) + "\n...[TRUNCATED FOR LENGTH]" 
            : documentText;

        const messages = [
            { role: "system", content: PROMPTS['DOCUMENT_ANALYZER'] },
            { role: "user", content: `Here is the legal document text to analyze:\n\n${truncatedText}` }
        ];

        const completion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.2, // Low temperature for factual analysis
            max_tokens: 2500,
            response_format: { type: "json_object" } // Force JSON output
        });

        const reply = completion.choices[0]?.message?.content;
        
        if (reply) {
            console.log("✅ Document Analysis Complete");
            try {
                return JSON.parse(reply);
            } catch (parseError) {
                console.error("❌ Failed to parse Groq JSON response:", reply);
                throw new Error("AI returned invalid format");
            }
        } else {
            throw new Error("Empty response from AI");
        }

    } catch (error) {
        console.error("❌ Document Analysis Failed:", error.message);
        throw error;
    }
}

/**
 * Chat specifically contextualized to the document
 */
async function chatAboutDocument(documentText, userQuestion, chatHistory = []) {
    try {
        if (!groq) initializeGroq();

        // Limit document text 
        const maxTextLength = 20000;
        const truncatedText = documentText.length > maxTextLength 
            ? documentText.substring(0, maxTextLength) + "\n...[TRUNCATED]" 
            : documentText;

        const systemPrompt = PROMPTS['DOCUMENT_CHAT'] + 
            `\n\n--- DOCUMENT TEXT ---\n${truncatedText}\n--- END DOCUMENT TEXT ---`;

        const messages = [
            { role: "system", content: systemPrompt }
        ];

        // Add history
        chatHistory.forEach(msg => {
            if (msg.role && msg.content) {
                messages.push({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content });
            }
        });

        // Add new question
        messages.push({ role: "user", content: userQuestion });

        const completion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            max_tokens: 1500,
        });

        const reply = completion.choices[0]?.message?.content;
        return reply || "I'm sorry, I couldn't generate an answer based on this document.";

    } catch (error) {
        console.error("❌ Document Chat Failed:", error.message);
        throw error;
    }
}

module.exports = {
    analyzeDocument,
    chatAboutDocument
};
