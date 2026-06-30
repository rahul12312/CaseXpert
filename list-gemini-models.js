const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function listModels() {
    const log = [];

    try {
        log.push("Listing available Gemini models...");
        log.push(`API Key exists: ${!!process.env.GEMINI_API_KEY}`);
        log.push(`API Key (first 10 chars): ${process.env.GEMINI_API_KEY?.substring(0, 10)}...`);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try to list models
        try {
            const models = await genAI.listModels();
            log.push(`\n✅ Successfully listed models:`);
            for await (const model of models) {
                log.push(`  - ${model.name} (${model.displayName})`);
            }
        } catch (error) {
            log.push(`\n❌ Failed to list models: ${error.message}`);
        }

    } catch (error) {
        log.push(`Fatal Error: ${error.message}`);
    }

    const output = log.join('\n');
    console.log(output);
    fs.writeFileSync('gemini-models-list.txt', output);
}

listModels();
