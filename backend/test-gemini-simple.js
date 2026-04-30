// Simple test for Gemini API
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAYwuW_A8KG1uzLM2Vb7uQrqqCiuNlgRLU";
        console.log('API Key:', apiKey.substring(0, 20) + '...');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Say hello in one sentence.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS! Gemini is working!');
        console.log('Response:', text);

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        // Try alternative model
        try {
            console.log('\nTrying alternative model...');
            const genAI = new GoogleGenerativeAI("AIzaSyAYwuW_A8KG1uzLM2Vb7uQrqqCiuNlgRLU");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const result = await model.generateContent("Say hello");
            const response = await result.response;
            console.log('\n✅ Alternative model works!');
            console.log('Response:', response.text());
        } catch (err2) {
            console.error('Alternative also failed:', err2.message);
        }
    }
}

testGemini();
