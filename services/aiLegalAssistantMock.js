// ============================================================================
// Mock AI Legal Assistant Service - For Testing Without OpenAI Credits
// ============================================================================

/**
 * Mock AI responses for common legal questions
 */
const mockResponses = {
    bail: `**What is Bail?**

Bail is a legal mechanism that allows an accused person to be released from custody while awaiting trial. Here's what you need to know:

**Key Points:**
• Bail is a temporary release from jail pending trial
• The accused must promise to appear in court when required
• Usually involves paying a security amount (bail bond)
• Can be granted by police, magistrate, or court

**Types of Bail in India:**
1. **Regular Bail** - Applied for after arrest
2. **Anticipatory Bail** - Applied for before arrest (Section 438 CrPC)
3. **Interim Bail** - Temporary bail for a short period

**When is Bail Granted?**
• For bailable offenses - bail is a right
• For non-bailable offenses - at court's discretion
• Factors considered: nature of crime, evidence, flight risk

**Important:** Bail is not a right in all cases. Serious crimes may result in bail being denied.

⚖️ Disclaimer: This is general legal information only, not legal advice. For specific legal matters, please consult a qualified lawyer or advocate.`,

    default: `I understand you have a legal question. As an AI Legal Assistant, I can help you with:

• Explaining legal concepts and terms
• Understanding Indian laws and procedures
• Drafting basic legal documents
• Answering general legal questions
• Explaining your rights and obligations

**Common Topics I Can Help With:**
- Criminal law (IPC, CrPC)
- Civil law (CPC, Contract Act)
- Family law (Marriage, Divorce, Custody)
- Property law
- Consumer rights
- Employment law

Please ask your specific question, and I'll do my best to provide helpful information.

⚖️ Disclaimer: This is general legal information only, not legal advice. For specific legal matters, please consult a qualified lawyer or advocate.`
};

/**
 * Get a mock response based on the question
 * @param {string} question - User's question
 * @returns {string} - Mock AI response
 */
function getMockResponse(question) {
    const lowerQuestion = question.toLowerCase();

    // Check for bail-related questions
    if (lowerQuestion.includes('bail') || lowerQuestion.includes('bailable')) {
        return mockResponses.bail;
    }

    // Check for FIR-related questions
    if (lowerQuestion.includes('fir') || lowerQuestion.includes('first information report')) {
        return `**What is an FIR (First Information Report)?**

An FIR is the first step in the criminal justice process in India.

**Key Points:**
• Written document prepared by police when they receive information about a cognizable offense
• Recorded under Section 154 of CrPC
• Can be filed by anyone - victim, witness, or even third party
• Must be filed at the police station having jurisdiction

**What Happens After FIR?**
1. Police register the complaint
2. Investigation begins
3. You receive a copy of the FIR
4. Police file a charge sheet if evidence is found

**Important Rights:**
• You have the right to get a free copy of the FIR
• FIR cannot be refused for cognizable offenses
• You can file FIR online in many states

⚖️ Disclaimer: This is general legal information only, not legal advice. For specific legal matters, please consult a qualified lawyer or advocate.`;
    }

    // Check for divorce-related questions
    if (lowerQuestion.includes('divorce') || lowerQuestion.includes('marriage')) {
        return `**Divorce in India - Overview**

Divorce is the legal dissolution of marriage. Here's what you need to know:

**Grounds for Divorce (Hindu Marriage Act):**
• Adultery
• Cruelty (physical or mental)
• Desertion for 2+ years
• Conversion to another religion
• Mental disorder
• Communicable disease
• Mutual consent

**Types of Divorce:**
1. **Mutual Consent Divorce** - Both parties agree (faster, 6-18 months)
2. **Contested Divorce** - One party files (longer, 2-5 years)

**Process:**
1. File petition in family court
2. Serve notice to spouse
3. Court hearings
4. Final decree

**Important:** Different personal laws apply to different religions (Hindu, Muslim, Christian, etc.)

⚖️ Disclaimer: This is general legal information only, not legal advice. For specific legal matters, please consult a qualified lawyer or advocate.`;
    }

    // Default response
    return mockResponses.default;
}

/**
 * Mock function to simulate AI Legal Assistant
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} - Mock AI response
 */
async function askAiLegalAssistant(messages) {
    try {
        console.log('\n🤖 Mock AI Legal Assistant - Processing request...');
        console.log(`   Messages count: ${messages.length}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the last user message
        const userMessage = messages[messages.length - 1];
        if (!userMessage || userMessage.role !== 'user') {
            throw new Error('No user message found');
        }

        const question = userMessage.content;
        console.log(`   Question: "${question.substring(0, 100)}..."`);

        // Get mock response
        const response = getMockResponse(question);

        console.log('✅ Mock response generated successfully');

        return response;

    } catch (error) {
        console.error('\n❌ Mock AI Assistant Error:', error.message);
        throw error;
    }
}

/**
 * Build the system prompt for the AI Legal Assistant
 * @returns {object} - System message object
 */
function getSystemPrompt() {
    return {
        role: 'system',
        content: `You are "AI Legal Assistant", a helpful legal information bot for the CaseXpert platform in India.

IMPORTANT: This is a MOCK version for testing. Real OpenAI integration requires API credits.

You provide general legal information and education only. You are NOT a licensed advocate.`
    };
}

module.exports = {
    askAiLegalAssistant,
    getSystemPrompt
};
