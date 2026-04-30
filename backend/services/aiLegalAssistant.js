// ============================================================================
// AI Legal Assistant Service - OpenAI Integration
// ============================================================================

const OpenAI = require("openai");

// Initialize OpenAI client with API key from environment
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Ask the AI Legal Assistant a question
 * @param {Array} messages - Array of message objects with { role, content }
 * @returns {Promise<string>} - AI assistant's response
 */
async function askAiLegalAssistant(messages) {
  try {
    console.log("\n🤖 AI Legal Assistant - Processing request...");
    console.log(`   Messages count: ${messages.length}`);
    
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in .env file.");
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is required and must not be empty.");
    }

    // Call OpenAI Chat Completions API
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o-mini for cost-effective reasoning
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    // Extract the assistant's reply
    const assistantReply = response.choices[0].message.content;

    console.log("✅ AI response generated successfully");
    console.log(`   Tokens used: ${response.usage.total_tokens}`);
    
    return assistantReply;

  } catch (error) {
    console.error("\n❌ AI Legal Assistant Error:");
    console.error("   Message:", error.message);
    
    // Handle specific OpenAI errors
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
    }
    
    // Handle network or other errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error("Cannot connect to OpenAI API. Please check your internet connection.");
    }
    
    // Re-throw with clean message
    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Build the system prompt for the AI Legal Assistant
 * @returns {object} - System message object
 */
function getSystemPrompt() {
  return {
    role: "system",
    content: `You are "AI Legal Assistant", a helpful legal information bot for the CaseXpert platform in India.

IMPORTANT RULES:
- You are NOT a licensed advocate and you do NOT give formal legal advice.
- You provide general legal information and education only.
- You focus mainly on Indian law unless the user clearly asks about another jurisdiction.

YOUR CAPABILITIES:
1. Explain legal concepts, terms, and procedures in simple, easy-to-understand language.
2. Help users understand their legal rights and obligations in general terms.
3. Provide information about common legal processes (filing cases, documentation, court procedures).
4. Help draft basic legal document templates (agreements, notices, applications, affidavits).
5. Explain differences between legal concepts (civil vs criminal, bail vs anticipatory bail, etc.).
6. Provide information about Indian legal acts and laws (IPC, CrPC, CPC, etc.).

WHAT YOU SHOULD DO:
- Use simple, non-technical language whenever possible.
- Explain legal jargon when you use it.
- Be helpful, patient, and empathetic.
- Provide step-by-step guidance when appropriate.
- Suggest when a user should consult a qualified lawyer.
- Focus on Indian law (IPC, CrPC, CPC, Constitution, etc.) unless asked otherwise.

WHAT YOU MUST NOT DO:
- Never claim to be a lawyer or provide legal advice.
- Never guarantee outcomes in legal matters.
- Never tell users they don't need a lawyer for serious matters.
- Never provide advice on illegal activities.

DISCLAIMER:
Always end your responses with this disclaimer:
"⚖️ Disclaimer: This is general legal information only, not legal advice. For specific legal matters, please consult a qualified lawyer or advocate."

Be concise but thorough. Aim for clarity and helpfulness.`
  };
}

module.exports = {
  askAiLegalAssistant,
  getSystemPrompt
};
