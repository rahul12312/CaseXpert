const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function listModels() {
    const apiKey = "AIzaSyBouFZ5GqP9oE1ZMtw-DrLqGgbIfolB54A";
    const log = [];
    log.push("Listing models with provided API key...");

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // We can't list models directly with the SDK easily in all versions, 
        // but let's try to infer from a simple fetch if SDK fails

        // Using raw fetch to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            log.push("✅ Successfully listed models:");
            data.models.forEach(model => {
                log.push(`- ${model.name} (${model.displayName})`);
                log.push(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
            });
        } else {
            log.push("❌ Failed to list models (no models found in response)");
            log.push(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        log.push(`❌ Failed to list models: ${error.message}`);
    }

    fs.writeFileSync('model-list-results.txt', log.join('\n'));
    console.log("List finished. Check model-list-results.txt");
}

listModels();
