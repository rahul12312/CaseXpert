const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
    const apiKey = "AIzaSyBouFZ5GqP9oE1ZMtw-DrLqGgbIfolB54A"; // Key provided by user
    console.log("Testing specific models...");

    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash-lite"
    ];

    for (const modelName of models) {
        try {
            console.log(`\nTrying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}!`);
            console.log(`Response: ${response.text()}`);
            break;
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}`);
            console.log(`Error: ${error.message.split('\n')[0]}`);
        }
    }
}

testKey();
