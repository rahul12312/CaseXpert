// ============================================================================
// AI Legal Assistant - Test Script
// ============================================================================

require("dotenv").config();
const { askAiLegalAssistant, getSystemPrompt } = require("./services/aiLegalAssistant");

// Test questions
const testQuestions = [
  "What is the difference between civil case and criminal case?",
  "How do I file an FIR in India?",
  "What are my rights during police questioning?",
  "Explain bail and anticipatory bail"
];

async function testAIAssistant() {
  console.log("\n" + "=".repeat(70));
  console.log("🧪 AI Legal Assistant - Test Suite");
  console.log("=".repeat(70) + "\n");

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is not set in .env file");
    console.error("   Please add your OpenAI API key to .env file");
    process.exit(1);
  }

  console.log("✅ OpenAI API key found");
  console.log(`   Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);
  console.log();

  // Test each question
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📝 Test ${i + 1}/${testQuestions.length}`);
    console.log(`${"=".repeat(70)}\n`);
    console.log(`Question: "${question}"\n`);

    try {
      // Build messages array
      const messages = [
        getSystemPrompt(),
        { role: "user", content: question }
      ];

      // Call AI service
      const startTime = Date.now();
      const answer = await askAiLegalAssistant(messages);
      const duration = Date.now() - startTime;

      // Display results
      console.log("✅ Response received successfully");
      console.log(`⏱️  Response time: ${duration}ms`);
      console.log(`📏 Response length: ${answer.length} characters`);
      console.log("\n" + "-".repeat(70));
      console.log("AI Response:");
      console.log("-".repeat(70));
      console.log(answer);
      console.log("-".repeat(70));

      // Check for disclaimer
      if (answer.includes("Disclaimer") || answer.includes("⚖️")) {
        console.log("\n✅ Disclaimer found in response");
      } else {
        console.log("\n⚠️  Warning: Disclaimer not found in response");
      }

      // Wait before next test to avoid rate limiting
      if (i < testQuestions.length - 1) {
        console.log("\n⏳ Waiting 2 seconds before next test...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error("\n❌ Test failed:");
      console.error("   Error:", error.message);
      
      if (error.message.includes("429")) {
        console.error("\n💡 Tip: Your API key has exceeded its quota.");
        console.error("   Go to https://platform.openai.com/account/billing");
        console.error("   to add credits or upgrade your plan.");
        break;
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("🏁 Test Suite Complete");
  console.log("=".repeat(70) + "\n");
}

// Run tests
testAIAssistant().catch(error => {
  console.error("\n❌ Fatal error:", error.message);
  process.exit(1);
});
