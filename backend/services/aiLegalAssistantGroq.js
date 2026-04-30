// ============================================================================
// AI Legal Assistant - Groq Integration (LLaMA 3)
// ============================================================================

const Groq = require("groq-sdk");
const { PROMPTS } = require("./aiPrompts");

let groq = null;

function initializeGroq() {
    if (!process.env.GROQ_API_KEY) {
        console.error("❌ FATAL: GROQ_API_KEY is missing in environment variables.");
        throw new Error("Groq API key is not configured.");
    }

    // Initialize Groq client
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("✅ Groq Service Initialized (Model: llama-3.3-70b-versatile)");
}

/**
 * Safe Fallback Response
 */
function getFallbackResponse() {
    return {
        reply: "I am currently unable to access the AI service. Here is general legal information based on common Indian law principles:\n\n" +
            "1. **Consult a Lawyer:** For specific advice, always consult a qualified advocate.\n" +
            "2. **Emergency:** Dial 100 or 112 for immediate police assistance.\n" +
            "3. **Legal Aid:** You may be eligible for free legal aid services.\n\n" +
            "Please try asking your question again in a moment.",
        source: "fallback"
    };
}

/**
 * Main AI Query Function
 */
async function askAiLegalAssistant(messages, task = 'DEFAULT_CHAT', language = 'en') {
    // Default fallback (only returned if error occurs)
    const fallbackResponse = getFallbackResponse();

    const languageNames = {
        'en': 'English',
        'hi': 'Hindi (हिन्दी)',
        'mr': 'Marathi (मराठी)',
        'ta': 'Tamil (தமிழ்)',
        'te': 'Telugu (తెలుగు)',
        'gu': 'Gujarati (ગુજરાતી)',
        'kn': 'Kannada (ಕನ್ನಡ)',
        'ml': 'Malayalam (മലയാളം)',
        'pa': 'Punjabi (ਪੰਜਾਬੀ)',
        'bn': 'Bengali (বাংলা)'
    };

    try {
        console.log(`🚀 Starting Groq AI Request (Lang: ${language})...`);

        if (!groq) initializeGroq();

        // 1. Validation
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.warn("⚠️ Empty messages received");
            return fallbackResponse;
        }

        // 2. System Prompt Construction
        let systemPrompt = (PROMPTS[task] || PROMPTS['DEFAULT_CHAT']);

        // Add Language Constraint
        const targetLang = languageNames[language] || 'English';
        systemPrompt += `\n\nCRITICAL LANGUAGE RULE: Respond ONLY in ${targetLang}. All legal explanations, advice, and greetings must be in ${targetLang}. Preserve legal accuracy in the translations.`;

        // 3. Prepare Messages for Groq
        const groqMessages = [
            { role: "system", content: systemPrompt }
        ];

        // Format history
        messages.forEach(msg => {
            // Map 'model' role from Gemini to 'assistant' for Groq/OpenAI compatible format
            const role = (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user';
            if (msg.role !== 'system') {
                groqMessages.push({
                    role: role,
                    content: msg.content || ""
                });
            }
        });

        console.log(`   📤 Sending to Groq LLaMA 3 (${groqMessages.length} messages)...`);

        // 4. API Call
        const completion = await groq.chat.completions.create({
            messages: groqMessages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 2000,
        });

        const reply = completion.choices[0]?.message?.content;

        if (reply) {
            console.log("   ✅ Groq Response Received");
            return {
                reply: reply,
                source: "groq"
            };
        } else {
            throw new Error("Empty response received from Groq");
        }

    } catch (error) {
        console.error("❌ Groq Call Failed:");
        console.error("   Message:", error.message);
        if (error.error) console.error("   Details:", JSON.stringify(error.error));

        // Only return fallback on actual error
        console.warn("   ⚠️ Returning Fallback Response due to error.");
        return fallbackResponse;
    }
}

module.exports = {
    askAiLegalAssistant
};
